-- ============================================
-- Vibe Coding 管理后台 - 数据库建表脚本
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 给 profiles 表添加 role 字段（管理员角色）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. 设置管理员账号（请先在 Supabase 注册 cleckoneck@gmail.com，然后执行此语句）
UPDATE profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'cleckoneck@gmail.com');

-- 3. 导航网站推荐
CREATE TABLE IF NOT EXISTS nav_sites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '其他',
  icon_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. AI 提示词
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  content text DEFAULT '',
  category text DEFAULT '通用',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. MCP 服务器
CREATE TABLE IF NOT EXISTS mcp_servers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  url text DEFAULT '',
  category text DEFAULT '通用',
  icon_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6. Skills 技能
CREATE TABLE IF NOT EXISTS skills_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '通用',
  url text DEFAULT '',
  icon_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 7. 首页配置
CREATE TABLE IF NOT EXISTS home_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key text UNIQUE NOT NULL,
  module_name text NOT NULL,
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_nav_sites_active_sort ON nav_sites(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active_sort ON ai_prompts(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_active_sort ON mcp_servers(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_skills_data_active_sort ON skills_data(is_active, sort_order);

-- 8. 初始化首页模块配置
INSERT INTO home_config (module_key, module_name, is_visible, sort_order) VALUES
  ('featured', '精选作品', true, 1),
  ('trending', '本周热门作品', true, 2),
  ('creators', '创作者榜单', true, 3),
  ('nav_sites', '导航网站推荐', true, 10),
  ('ai_prompts', 'AI 提示词', true, 20),
  ('mcp_servers', 'MCP 服务', true, 30),
  ('skills', 'Skills 技能', true, 40)
ON CONFLICT (module_key) DO NOTHING;

-- 9. 顶部导航栏链接配置
CREATE TABLE IF NOT EXISTS navbar_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key text UNIQUE NOT NULL,
  module_name text NOT NULL,
  route_path text NOT NULL,
  icon_key text DEFAULT '',
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO navbar_config (module_key, module_name, route_path, icon_key, is_visible, sort_order) VALUES
  ('nav_sites', 'AI 导航', '/nav-sites', 'compass', true, 1),
  ('ai_prompts', 'AI 提示词', '/prompts', 'message-square', true, 2),
  ('skills', 'Skills', '/skills', 'wrench', true, 3),
  ('mcp_servers', 'MCP', '/mcp', 'server', true, 4)
ON CONFLICT (module_key) DO NOTHING;
