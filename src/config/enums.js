export const PLATFORM_TYPES = [
  { value: 'mobile', label: { zh: 'Mobile', en: 'Mobile' }, icon: 'Smartphone' },
  { value: 'web', label: { zh: 'Web / Desktop', en: 'Web / Desktop' }, icon: 'Monitor' },
]

export const CONTENT_CATEGORIES = [
  { value: 'showcase', label: { zh: '作品展示', en: 'Showcase' }, icon: 'Eye', color: '#a78bfa' },
  { value: 'product', label: { zh: '产品发布', en: 'Product' }, icon: 'Rocket', color: '#22c55e' },
  { value: 'experimental', label: { zh: '实验项目', en: 'Experimental' }, icon: 'FlaskConical', color: '#f97316' },
]

export const AI_TOOLS = [
  { value: 'Cursor', label: 'Cursor', color: '#00D4AA' },
  { value: 'Claude Code', label: 'Claude Code', color: '#D97706' },
  { value: 'Codex', label: 'Codex', color: '#10B981' },
  { value: 'Windsurf', label: 'Windsurf', color: '#3B82F6' },
  { value: 'Trae', label: 'Trae', color: '#6366F1' },
  { value: 'Qoder', label: 'Qoder', color: '#F472B6' },
  { value: 'Devin', label: 'Devin', color: '#14B8A6' },
  { value: 'Lovable', label: 'Lovable', color: '#E11D48' },
  { value: 'v0', label: 'v0', color: '#F5F5F5' },
  { value: 'Kiro', label: 'Kiro', color: '#FF9900' },
  { value: 'Aider', label: 'Aider', color: '#8B5CF6' },
  { value: 'Cline', label: 'Cline', color: '#EC4899' },
  { value: 'Roo Code', label: 'Roo Code', color: '#F97316' },
  { value: 'Amp', label: 'Amp', color: '#22D3EE' },
  { value: 'Goose', label: 'Goose', color: '#1D4ED8' },
  { value: 'Replit', label: 'Replit', color: '#F26207' },
  { value: 'GitHub Copilot', label: 'GitHub Copilot', color: '#6E40C9' },
  { value: 'OpenClaw', label: 'OpenClaw', color: '#F59E0B' },
  { value: 'Hermes Agent', label: 'Hermes Agent', color: '#EF4444' },
  { value: 'OpenCode', label: 'OpenCode', color: '#06B6D4' },
  { value: 'KiloCode', label: 'KiloCode', color: '#84CC16' },
  { value: 'Continue', label: 'Continue', color: '#0EA5E9' },
  { value: 'Zencoder', label: 'Zencoder', color: '#A855F7' },
  { value: 'Other', label: 'Other', color: '#6B7280' },
]

export const AI_MODELS = [
  { value: 'Claude', label: 'Claude', color: '#D97706' },
  { value: 'GPT', label: 'GPT', color: '#10B981' },
  { value: 'Gemini', label: 'Gemini', color: '#3B82F6' },
  { value: 'DeepSeek', label: 'DeepSeek', color: '#06B6D4' },
  { value: 'Grok', label: 'Grok', color: '#1D9BF0' },
  { value: 'Kimi', label: 'Kimi', color: '#6366F1' },
  { value: 'Qwen', label: 'Qwen', color: '#FF6A00' },
  { value: 'Llama', label: 'Llama', color: '#1877F2' },
  { value: 'Mistral', label: 'Mistral', color: '#FF7000' },
  { value: 'MiMo', label: 'MiMo', color: '#8B5CF6' },
  { value: '豆包', label: '豆包', color: '#EC4899' },
  { value: 'MiniMax', label: 'MiniMax', color: '#F59E0B' },
  { value: '文心', label: '文心', color: '#2932E1' },
  { value: '智谱', label: '智谱', color: '#4338CA' },
  { value: 'Baichuan', label: 'Baichuan', color: '#059669' },
  { value: 'Yi', label: 'Yi', color: '#7C3AED' },
  { value: 'InternLM', label: 'InternLM', color: '#0891B2' },
  { value: 'Cohere', label: 'Cohere', color: '#39D353' },
  { value: 'Groq', label: 'Groq', color: '#F55036' },
  { value: 'Other', label: 'Other', color: '#6B7280' },
]

export function getToolConfig(value) {
  return AI_TOOLS.find(t => t.value === value) || { value, label: value, color: '#6B7280' }
}

export function getModelConfig(value) {
  return AI_MODELS.find(m => m.value === value) || { value, label: value, color: '#6B7280' }
}
