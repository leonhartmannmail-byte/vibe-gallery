-- ============================================
-- 初始数据填充（从 ai.codefather.cn 采集）
-- ============================================

-- 导航网站推荐
INSERT INTO nav_sites (name, url, description, category, sort_order) VALUES
('Stitch', 'https://stitch.withgoogle.com', 'Google Labs 推出的 AI 原生设计工具', 'AI图像', 1),
('千问', 'https://qianwen.aliyun.com', '基于Qwen大模型的全能AI助手', 'AI聊天对话', 2),
('扣子APP', 'https://www.coze.com', '字节跳动推出的职场AI助手', 'AI智能体', 3),
('悟空', 'https://wukong.com', '阿里推出的企业级AI原生工作平台', 'AI办公', 4),
('ArkClaw', 'https://arkclaw.com', '火山引擎推出的云端托管版 OpenClaw 服务', 'AI智能体', 5),
('AnyGen', 'https://anygen.com', '字节跳动推出的AI办公智能体', 'AI办公', 6),
('Typeless', 'https://typeless.ai', 'AI语音输入，实时智能润色', 'AI办公', 7),
('Vemus未音', 'https://vemus.com', '腾讯音乐首款AI音乐创作工具', 'AI音频音乐', 8),
('Ardot', 'https://ardot.com', '腾讯推出的AI智能设计工具', 'AI商业设计', 9),
('讯飞同传', 'https://www.iflyrec.com', '科大讯飞出品的专业AI同声传译平台', 'AI办公', 10),
('讯飞译制', 'https://www.iflytrans.com', '科大讯飞AI音视频本地化平台', 'AI办公', 11),
('音潮APP', 'https://yinchao.com', 'AI驱动的音乐创作与互动平台', 'AI音频音乐', 12);

-- AI 提示词
INSERT INTO ai_prompts (name, description, category, sort_order) VALUES
('雅思写作提分对比训练', '围绕同一写作题目，呈现不同分数段的范文示例，并逐条解析得分差异背后的逻辑——从任务回应、逻辑连贯、词汇语法到语言准确性，帮你精准定位提分关键。', '教育学习', 1),
('雅思写作提分对照模板', '围绕同一写作题目，提供多个不同分数段的范文示例，并逐条解析得分差异背后的语言质量、逻辑结构与任务完成度原因。', '教育学习', 2),
('沉浸式文字冒险游戏', '深度构建世界观与剧情脉络，带来更具代入感和丰富性的互动叙事体验。', '游戏', 3);

-- MCP 服务器
INSERT INTO mcp_servers (name, description, category, sort_order) VALUES
('Playwright MCP Server', '用于 Playwright 浏览器自动化，使 AI 助手能够控制浏览器、运行测试以及自动化网页交互。', '开发工具', 1),
('Notion MCP Server', '帮助读取、搜索和管理 Notion 页面及数据库。', '开发工具', 2),
('Context7', '将最新的库文档和代码示例直接获取到 LLM 的 prompts 中。', '开发工具', 3),
('GitHub MCP Server', '帮助管理仓库、问题、拉取请求和代码。', '开发工具', 4),
('GitLab MCP Server', '使 AI 助手能够管理代码仓库、问题、合并请求以及 CI/CD 流水线。', '开发工具', 5),
('Chrome DevTools MCP Server', '让 AI 助手能够检查页面、调试 JavaScript 以及分析网络流量。', '开发工具', 6),
('Framelink Figma MCP Server', '粘贴 Figma 链接就能把设计转代码，Cursor 开发效率直接拉满。', '开发工具', 7),
('Web to MCP', '捕获网站组件并直接发送给 Cursor 和 Claude Code 等 AI 编码助手。', '浏览器自动化', 8),
('Redis MCP Server', '让 AI 助手能够与 Redis 数据库交互，执行缓存和数据操作。', '开发工具', 9),
('postgres-mcp', '提供 PostgreSQL 数据库管理功能，协助进行分析、调试、模式管理、数据迁移和监控。', '开发工具', 10),
('MCP Toolbox For Databases', '用自然语言操作数据库，AI写SQL、管表、建索引，开发快到飞起。', '开发工具', 11),
('Sequential Thinking', '通过将复杂问题分解为多个连续阶段，促进结构化和渐进式的思考。', '开发工具', 12),
('GPT Researcher', '通过 MCP 协议使 LLM 应用能够执行深入的研究。', '研究与数据', 13),
('MiniMax MCP', '用 MiniMax MCP 一键生成带克隆语音的图文视频，内容创作快到飞起。', '内容创作', 14),
('EdgeOne Pages MCP', '写完 HTML 直接部署，秒生成公网可访问链接，分享页面就像发文件一样简单。', '云平台', 15),
('Amap Maps', '使任何 MCP 协议客户端都能无缝集成高德地图，以实现多种基于位置的服务。', '生活管理', 16),
('Baidu Map', '用MCP协议调百度地图API，查地点、规划路线像聊天一样自然。', '生活管理', 17),
('Howtocook Mcp', '基于程序员在家做饭指南的 MCP Server，帮你推荐菜谱、规划膳食。', '生活管理', 18);

-- Skills 技能
INSERT INTO skills_data (name, description, category, sort_order) VALUES
('frontend-design', '打造独具辨识度的生产级前端界面，强调大胆美学选择与精细实现，涵盖网页组件、落地页、仪表盘等各类UI构建需求。', '编程开发', 1),
('pdf', '提供对 PDF 文档的完整处理能力，包括文本和表格提取、文档合并拆分、内容生成及表单操作。', '文档处理', 2),
('docx', '支持专业级 Word 文档的全生命周期处理，包括从零创建结构化文档、精准编辑内容、管理修订痕迹与批注。', '文档处理', 3),
('xlsx', '支持创建、编辑和分析各类电子表格文件，具备公式计算、格式设置、数据透视与图表生成能力。', '文档处理', 4),
('pptx', '支持从零创建、基于模板生成或编辑现有 PowerPoint 演示文稿，涵盖内容生成、布局调整、主题配色分析。', '文档处理', 5),
('ui-ux-pro-max', '提供面向产品全生命周期的 UI/UX 设计智能支持，覆盖风格选择、色彩系统、字体搭配、交互规范。', '设计', 6),
('java-dev', '提供 Java 项目开发全流程的标准化指导，涵盖代码风格、异常与空值处理、并发编程、单元测试。', '编程开发', 7),
('vue', '提供 Vue 3 单文件组件开发、组合式函数编写、客户端工具函数设计及单元测试的完整实践指南。', '编程开发', 8),
('skill-creator', '指导创建高效技能模块，通过封装专用工作流、工具集成与领域知识，将通用模型转化为特定任务专家。', 'AI工作流', 9),
('codex-skill', '通过自动化代码执行能力，实现从需求分析到代码修改的端到端编程任务处理。', '编程开发', 10),
('claude-skill', '提供无需人工干预的自动化代码处理能力，支持代码分析、缺陷修复、功能实现、安全审查等任务。', '编程开发', 11),
('mcp-builder', '指导构建高质量的 MCP 服务器，通过合理设计工具使 LLM 能高效调用外部服务。', 'AI工作流', 12),
('frontend-code-review', '执行前端代码审查，覆盖 React 与 Next.js 项目的类型安全、组件结构及性能优化。', '代码质量', 13),
('frontend-testing', '提供前端单元与组件测试能力，支持对逻辑函数、用户交互及界面渲染的验证。', '代码质量', 14),
('doc-coauthoring', '协助用户系统化地协同撰写各类结构化文档，涵盖技术规范、决策说明、产品提案等场景。', '文档处理', 15),
('prompt-lookup', '专注于AI提示词的发现、获取与优化，支持按关键词、类型、领域和标签检索高质量提示模板。', 'AI工作流', 16),
('skill-lookup', '支持在技能生态中发现、获取和安装可复用的 AI 能力组件。', 'AI工作流', 17),
('webnovel-write', '实现网络小说章节的全流程自动化创作与质量管控，涵盖上下文智能聚合、符合设定的纯文本生成。', '内容创作', 18);
