-- ========================================
-- Vibe Coding Showcase - 数据库初始化
-- 在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 1. 创建 profiles 表（用户资料）
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text default '',
  created_at timestamp with time zone default now()
);

-- 2. 创建 works 表（作品）
create table if not exists works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  cover_url text not null,
  images text[] default '{}',
  link text default '',
  tags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default now()
);

-- 3. 创建 likes 表（点赞）
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  work_id uuid references works(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, work_id)
);

-- 4. 创建 comments 表（评论）
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  work_id uuid references works(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- 5. 创建索引
create index if not exists idx_works_created_at on works(created_at desc);
create index if not exists idx_works_likes_count on works(likes_count desc);
create index if not exists idx_works_user_id on works(user_id);
create index if not exists idx_likes_work_id on likes(work_id);
create index if not exists idx_comments_work_id on comments(work_id);

-- 6. 新用户注册时自动创建 profile
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 7. 点赞时自动更新 likes_count
create or replace function update_likes_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update works set likes_count = likes_count + 1 where id = new.work_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update works set likes_count = likes_count - 1 where id = old.work_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create or replace trigger on_like_change
  after insert or delete on likes
  for each row execute function update_likes_count();

-- 8. 评论时自动更新 comments_count
create or replace function update_comments_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update works set comments_count = comments_count + 1 where id = new.work_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update works set comments_count = comments_count - 1 where id = old.work_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create or replace trigger on_comment_change
  after insert or delete on comments
  for each row execute function update_comments_count();

-- ========================================
-- RLS 策略（Row Level Security）
-- ========================================

-- 启用 RLS
alter table profiles enable row level security;
alter table works enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;

-- profiles: 所有人可读，只有本人可改
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- works: 所有人可读，登录用户可创建，作者可改/删
create policy "Works are viewable by everyone"
  on works for select using (true);

create policy "Authenticated users can create works"
  on works for insert with check (auth.uid() = user_id);

create policy "Users can update own works"
  on works for update using (auth.uid() = user_id);

create policy "Users can delete own works"
  on works for delete using (auth.uid() = user_id);

-- likes: 所有人可读，登录用户可创建/删除自己的
create policy "Likes are viewable by everyone"
  on likes for select using (true);

create policy "Authenticated users can like"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike"
  on likes for delete using (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可创建，作者可删
create policy "Comments are viewable by everyone"
  on comments for select using (true);

create policy "Authenticated users can comment"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);

-- ========================================
-- Storage 配置
-- ========================================

-- 创建存储桶
insert into storage.buckets (id, name, public)
  values ('works', 'works', true)
  on conflict (id) do nothing;

-- Storage 策略: 所有人可查看，登录用户可上传
create policy "Anyone can view work images"
  on storage.objects for select
  using (bucket_id = 'works');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'works' AND auth.role() = 'authenticated');

create policy "Users can delete own images"
  on storage.objects for delete
  using (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- 默认封面字段（新增）
-- ========================================
ALTER TABLE works ADD COLUMN IF NOT EXISTS cover_bg text DEFAULT NULL;
ALTER TABLE works ADD COLUMN IF NOT EXISTS cover_emoji text DEFAULT NULL;

-- ========================================
-- 平台分类 + AI 工具/模型（新增）
-- ========================================
ALTER TABLE works ADD COLUMN IF NOT EXISTS platform text DEFAULT 'web';
ALTER TABLE works ADD COLUMN IF NOT EXISTS ai_tools text[] DEFAULT '{}';
ALTER TABLE works ADD COLUMN IF NOT EXISTS ai_models text[] DEFAULT '{}';
ALTER TABLE works ADD COLUMN IF NOT EXISTS one_liner text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_works_platform ON works(platform);
CREATE INDEX IF NOT EXISTS idx_works_ai_tools ON works USING GIN(ai_tools);
CREATE INDEX IF NOT EXISTS idx_works_ai_models ON works USING GIN(ai_models);

-- ========================================
-- 内容分类（新增）
-- ========================================
ALTER TABLE works ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'showcase'
  CHECK (category IN ('showcase', 'product', 'experimental'));
CREATE INDEX IF NOT EXISTS idx_works_category ON works(category);
