// 运营配置文件 - 精选作品、合集、每周挑战
// workIds 填入数据库中已有的作品 UUID
// 后续可通过后台管理界面替换此文件

export const FEATURED_WORK_IDS = []

export const EDITOR_PICKS_IDS = []

export const COLLECTIONS = [
  {
    id: 'ai-dashboards',
    title: { zh: 'AI Dashboard 合集', en: 'AI Dashboard Collection' },
    description: { zh: '最优秀的 AI 仪表盘作品', en: 'The best AI dashboard works' },
    workIds: [],
    coverGradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
  },
  {
    id: 'saas-landing',
    title: { zh: 'SaaS Landing Pages', en: 'SaaS Landing Pages' },
    description: { zh: '精美的 SaaS 落地页设计', en: 'Beautiful SaaS landing page designs' },
    workIds: [],
    coverGradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
  },
  {
    id: 'cursor-projects',
    title: { zh: 'Cursor 作品集', en: 'Cursor Built Projects' },
    description: { zh: '用 Cursor AI 构建的项目', en: 'Projects built with Cursor AI' },
    workIds: [],
    coverGradient: 'linear-gradient(135deg, #059669, #10b981)',
  },
]

export const WEEKLY_CHALLENGE = {
  id: 'week-21',
  title: { zh: '本周挑战：AI 工具界面', en: 'Weekly Challenge: AI Tool UIs' },
  description: { zh: '用 Vibe Coding 构建一个 AI 工具界面', en: 'Build an AI tool interface with Vibe Coding' },
  tag: 'weekly-challenge',
  deadline: '2026-05-30',
}
