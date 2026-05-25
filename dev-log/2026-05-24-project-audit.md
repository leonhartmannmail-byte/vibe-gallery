# 项目审查报告 — 2026-05-24

> 自动生成，供早上查看。每小时检查一次，持续更新。

---

## 审查时间线

| 时间 | 审查内容 | 发现问题数 |
|------|----------|-----------|
| 01:02 | 全量代码审查（首次） | 31 |

---

## 严重问题（Critical）— 需立即修复

### 1. `/debug` 路由公开暴露，无鉴权
- **文件**: `src/App.jsx`, `src/pages/Debug.jsx`
- **风险**: 任何人访问 `/debug` 可看到 Supabase 连接状态、auth 状态、表结构、部分 API key
- **建议**: 从生产构建中移除，或加 auth guard 限制仅管理员访问

### 2. `likes_count` 不同步
- **文件**: `src/hooks/useWorks.js:169-197`, `src/components/LikeButton/LikeButton.jsx`
- **问题**: `toggleLike` 在 likes 表增删行，但**不更新 works 表的 `likes_count`**。虽然 Supabase 有 trigger 自动更新，但客户端乐观更新的数字和数据库实际值可能不同步
- **建议**: 点赞后 refetch work 数据，或在 toggleLike 中加 `?select=likes_count` 重新查询

### 3. Profile 页查询效率低
- **文件**: `src/pages/Profile.jsx:27-28`
- **问题**: 调用 `fetchWorks({ page: 0, sort: 'latest' })` 获取**全部作品**（不限用户），然后客户端过滤 `w.user_id === id`
- **建议**: `fetchWorks` 增加 `userId` 参数，改用 `?user_id=eq.xxx` 服务端过滤

### 4. `.env` 未加入 `.gitignore`
- **文件**: `.env`, `.gitignore`
- **风险**: 如推送到公开仓库，Supabase URL 和 anon key 永久暴露在 git 历史
- **建议**: 在 `.gitignore` 添加 `.env` 和 `.env.*`

### 5. `dangerouslySetInnerHTML` XSS 隐患
- **文件**: `src/components/CommentSection/CommentSection.jsx:142`
- **问题**: 用 `dangerouslySetInnerHTML` 渲染翻译文本中的 HTML（登录链接）
- **建议**: 改用 `<Link>` 组件替代

---

## 中等问题（Medium）— 建议尽快修复

### 6. 生产代码中大量 `console.log`
- **文件**: `src/hooks/useAuth.jsx`, `src/pages/EditWork.jsx`
- **问题**: 暴露 API 端点、响应数据、表单状态到浏览器控制台
- **建议**: 移除或替换为条件日志

### 7. 无代码分割 — 整个应用打包为 695KB 单文件
- **文件**: `src/App.jsx`
- **问题**: 所有页面组件 eager import，Vite 构建警告 chunk > 500KB
- **建议**: 用 `React.lazy()` + `Suspense` 做路由级代码分割

### 8. 无 404 页面
- **文件**: `src/App.jsx`
- **问题**: 访问不存在的路径显示空白页（仅导航栏）
- **建议**: 添加 `<Route path="*" element={<NotFound />} />`

### 9. fetchWorks 存在竞态条件
- **文件**: `src/pages/Home.jsx:37-40`
- **问题**: 快速切换 sort/tag 时，前一个请求可能后完成，覆盖正确结果
- **建议**: 用 AbortController 或请求序号机制

### 10. Navbar 下拉菜单无外部点击关闭
- **文件**: `src/components/Navbar/Navbar.jsx`
- **问题**: 点击头像打开菜单，但无 click-outside 或 Escape 键监听
- **建议**: 添加 useEffect 监听 document click

### 11. WorkCard 每次渲染创建 5 个 Framer Motion 值
- **文件**: `src/components/WorkCard/WorkCard.jsx:18-24`
- **问题**: 12+ 卡片 = 60+ 订阅，且组件未 memoize，父组件重渲染会重放动画
- **建议**: 用 `React.memo` 包裹 WorkCard，考虑共享 motion values

### 12-14. 多个 useEffect 缺少依赖
- `WorkDetail.jsx:28` — 缺 `loadWork`
- `CommentSection.jsx:18` — 缺 `loadComments`
- `Profile.jsx:24` — 缺 `fetchProfile`, `fetchWorks`
- **建议**: 用 `useCallback` 包裹或正确声明依赖

### 15. 评论不支持删除
- **文件**: `src/components/CommentSection/CommentSection.jsx`
- **问题**: 用户可发评论但不能删除自己的评论
- **建议**: 添加删除按钮 + `deleteComment` 函数

### 16. 图片无错误处理
- **文件**: `WorkCard.jsx:79-84`, `WorkDetail.jsx:130-139`
- **问题**: `<img>` 无 `onError`，图片加载失败显示破损图标
- **建议**: 添加 `onError` 回退到默认封面

### 17. WorkDetail `allImages[currentImage]` 可能 undefined
- **文件**: `src/pages/WorkDetail.jsx:132`
- **问题**: emoji 封面无图片时，`allImages` 为空数组，访问 `[0]` 为 undefined
- **建议**: 添加空数组保护

### 18. Grid 和 Skeleton 断点不一致
- **文件**: `Home.css` grid 用 1200px，loading 用 1024px
- **问题**: 1024-1200px 区间布局闪烁
- **建议**: 统一断点

---

## 低优先级（Low）

### 19-21. 重复代码
- `suggestedTags` 在 Publish.jsx 和 EditWork.jsx 各定义一次
- `handleAddTag`/`handleTagKeyDown`/`handleRemoveTag` 逻辑重复
- 时间格式化逻辑在 CommentSection 和 badges.js 各实现一次

### 22. `removeWorkMetadata` 和 `getTimeAgo` 导出但未使用
- 删除作品时未清理 localStorage 元数据（orphan data）

### 23. 元数据存 localStorage 而非数据库
- 跨设备/浏览器不同步，清除数据后丢失
- **长期方案**: 等 DB migration 后迁移为正式列

### 24. `.gradient-text` CSS 规则重复定义
- `globals.css` 中定义了两次

### 25. `@supabase/supabase-js` 未使用但仍打包
- 仅 Debug.jsx 使用，其他全用 sbQuery
- **建议**: 移除 import 可减 ~50KB bundle

### 26. `react-masonry-css` 依赖未使用
- MasonryGrid 组件目录存在但 Home 页已改用 CSS Grid

### 27. 无障碍性不足
- WorkCard 无 `aria-label`、LikeButton 无 aria-label、图片导航无 aria-label

### 28. WorkCard index 动画延迟导致加载更多时动画过慢
- `delay: index * 0.07`，第 10 张卡片延迟 700ms

### 29. Publish.jsx 图片验证错误信息不友好
- 快速模式和高级模式用同一个 `imageRequired` 错误

### 30. `formatCount(0)` 返回 null
- 0 赞的作品完全隐藏爱心图标（设计决策，但可能不符合预期）

### 31. WorkDetail 缩略图索引在 emoji 封面时可能漂移

---

## 构建状态

- ✅ `vite build` 成功
- ⚠️ Bundle 大小 694.69 KB（gzip 204KB），超过 500KB 建议上限
- 建议：代码分割 + 移除未使用依赖

---

## 02:03 检查

### 构建状态
- ✅ `vite build` 成功，279ms
- ⚠️ Bundle 仍为 694.69 KB（未变），chunk size 警告依旧

### 抽查文件

**LikeButton.jsx** — 发现问题：
- `useEffect` 缺少依赖（第 16 行应包含 `checkLiked`，第 22 行应包含 `initialCount`）— ESLint exhaustive-deps 会报警
- 点赞后 `setCount` 乐观更新不持久化（已在首轮标记，确认仍存在）

**CommentSection.jsx** — 发现问题：
- `dangerouslySetInnerHTML` 用于渲染登录提示 HTML（第 142 行），确认仍存在
- `useEffect` 缺少 `loadComments` 依赖（第 22 行）
- `comment-login-hint` 应改用 `<Link>` 组件，避免 XSS 隐患

### i18n 完整性
- ✅ zh.js 和 en.js 各 233 个键，完全匹配，无缺失

### CSS 检查
- ✅ Home.css Grid 和 Skeleton 断点已统一（上轮修复确认生效）
- ✅ 无语法错误

### 新发现
- 生产代码中共有 **21 处 `console.log/warn/error`** 调用，分布在 useAuth.jsx、EditWork.jsx、Home.jsx 等文件
- `LikeButton` 和 `CommentSection` 的 useEffect 依赖问题属于同一模式，建议统一修复

---

## 07:03 检查（最终轮）

### 构建状态
- ✅ `vite build` 成功，318ms
- ⚠️ Bundle 694.69 KB 未变，警告依旧

### 抽查文件

**Auth.jsx** — 代码质量良好：
- 错误处理完善，区分了 "Email not confirmed" 和 "Invalid login credentials"
- 表单验证逻辑清晰
- 无明显 bug

**Profile.jsx** — 确认已有问题：
- `useEffect` 缺少 `fetchProfile` 和 `fetchWorks` 依赖（第 29 行）
- `fetchWorks({ page: 0, sort: 'latest' })` 仍查询全表再客户端过滤（第 27 行、第 57 行）
- `console.error` 在生产代码中（第 41 行）

### i18n 完整性
- ✅ zh.js 和 en.js 各 233 个键，完全匹配

---

## 最终总结

> 审查时间：2026-05-24 01:02 — 07:27
> 审查轮次：3 轮（01:02 全量审查、02:03 抽查、07:03 最终轮）
> 总发现：31 个问题

### TOP 10 优先修复项

| 优先级 | 问题 | 文件 | 影响 |
|--------|------|------|------|
| **P0** | `/debug` 路由公开暴露 | `App.jsx`, `Debug.jsx` | 安全：泄露数据库结构和 API 状态 |
| **P0** | `.env` 未 gitignore | `.gitignore` | 安全：泄露 Supabase 项目信息 |
| **P1** | `likes_count` 不同步 | `useWorks.js`, `LikeButton.jsx` | 功能：点赞数刷新后丢失 |
| **P1** | Profile 页查询全表 | `Profile.jsx` | 性能：每次访问加载全部作品 |
| **P1** | 无代码分割 | `App.jsx` | 性能：695KB 单文件，首屏慢 |
| **P2** | 无 404 页面 | `App.jsx` | UX：访问不存在路径空白页 |
| **P2** | 21 处 console.log | 多文件 | 安全/规范：泄露内部状态 |
| **P2** | Navbar 下拉无外部关闭 | `Navbar.jsx` | UX：需点击头像才能关闭菜单 |
| **P2** | useEffect 依赖缺失 | 多文件 | 正确性：ESLint 报警，潜在 bug |
| **P3** | 图片无 onError 回退 | `WorkCard.jsx`, `WorkDetail.jsx` | UX：图片加载失败显示破损图标 |

### 已修复问题（本轮审查期间）
- ✅ Home.css Grid 和 Skeleton 断点统一
- ✅ i18n 翻译键完整（233 键匹配）

### 建议修复顺序
1. 先处理 P0 安全问题（debug 路由 + .env）
2. 再处理 P1 功能/性能问题
3. 最后处理 P2/P3 体验问题

> 文档生成完毕，供早上查看。
