export const PLATFORM_TYPES = [
  { value: 'mobile', label: { zh: 'Mobile', en: 'Mobile' }, icon: 'Smartphone' },
  { value: 'web', label: { zh: 'Web / Desktop', en: 'Web / Desktop' }, icon: 'Monitor' },
]

export const AI_TOOLS = [
  { value: 'Cursor', label: 'Cursor', color: '#00D4AA' },
  { value: 'Claude Code', label: 'Claude Code', color: '#D97706' },
  { value: 'Codex', label: 'Codex', color: '#10B981' },
  { value: 'Windsurf', label: 'Windsurf', color: '#3B82F6' },
  { value: 'Aider', label: 'Aider', color: '#8B5CF6' },
  { value: 'Cline', label: 'Cline', color: '#EC4899' },
  { value: 'OpenClaw', label: 'OpenClaw', color: '#F59E0B' },
  { value: 'Hermes Agent', label: 'Hermes Agent', color: '#EF4444' },
  { value: 'OpenCode', label: 'OpenCode', color: '#06B6D4' },
  { value: 'KiloCode', label: 'KiloCode', color: '#84CC16' },
  { value: 'Other', label: 'Other', color: '#6B7280' },
]

export const AI_MODELS = [
  { value: 'Claude', label: 'Claude', color: '#D97706' },
  { value: 'GPT', label: 'GPT', color: '#10B981' },
  { value: 'Gemini', label: 'Gemini', color: '#3B82F6' },
  { value: 'MiMo', label: 'MiMo', color: '#8B5CF6' },
  { value: 'DeepSeek', label: 'DeepSeek', color: '#06B6D4' },
  { value: '豆包', label: '豆包', color: '#EC4899' },
  { value: 'MiniMax', label: 'MiniMax', color: '#F59E0B' },
  { value: 'Other', label: 'Other', color: '#6B7280' },
]

export function getToolConfig(value) {
  return AI_TOOLS.find(t => t.value === value) || { value, label: value, color: '#6B7280' }
}

export function getModelConfig(value) {
  return AI_MODELS.find(m => m.value === value) || { value, label: value, color: '#6B7280' }
}
