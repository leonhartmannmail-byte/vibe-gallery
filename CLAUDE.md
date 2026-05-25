# CLAUDE.md - 项目工作指引

## 项目简介
Vibe Coding 作品展示网站 - 一个类似 Dribbble 的作品展示平台，用户可以发布、浏览、点赞、评论 Vibe Coding 作品。

## 重要文件路径

### 项目文档（docs/）
- 项目需求文档：`docs/01-项目需求文档.md`
- 技术架构文档：`docs/02-技术架构文档.md`
- 设计规范文档：`docs/03-设计规范文档.md`
- 开发执行步骤：`docs/04-开发执行步骤.md`

### 开发日志（dev-log/）
- 每日开发记录：`dev-log/YYYY-MM-DD.md`
- 开始工作前先阅读最新日志了解进度
- 结束工作时更新当日日志

## 工作流程

### 每次开发前
1. 阅读 `dev-log/` 中最新的日志文件，了解当前进度
2. 阅读 `docs/04-开发执行步骤.md`，确认下一步要做什么
3. 检查是否有未解决的问题

### 开发过程中
4. 按照执行步骤文档，一次只做一个小功能
5. 每完成一个步骤立即验证（运行项目、检查效果）
6. 遇到问题及时记录，不要硬撑

### 开发结束后
7. 更新当日 `dev-log/YYYY-MM-DD.md`
8. 记录完成项、待办项、遇到的问题

## 技术栈
- React 18 + Vite（前端框架 + 构建工具）
- Supabase（后端服务：数据库 + 认证 + 存储）
- Framer Motion（动效库）
- react-masonry-css（瀑布流布局）
- React Router v6（路由）
- Lucide React（图标）

## 代码规范
- 组件使用 PascalCase 命名（如 WorkCard.jsx）
- Hook 使用 camelCase 命名，以 use 开头（如 useAuth.js）
- 样式文件与组件同名（如 WorkCard.module.css）
- 每个组件一个文件夹，包含组件文件和样式文件

## 设计参考
- 风格参考：reactbits.dev（炫酷动效）
- 详细设计规范见：`docs/03-设计规范文档.md`

## 当前进度
- 状态：**规划阶段完成，待开始编码**
- 下一步：阶段一 - 项目初始化
