import {
  Cursor, ClaudeCode, Codex, Windsurf, Cline, OpenClaw,
  HermesAgent, KiloCode, OpenCode,
  Claude, OpenAI, Gemini, DeepSeek, Minimax, Doubao, XiaomiMiMo,
  Qwen, Coze, Google, Github, Notion,
  MCP, IFlyTekCloud,
} from '@lobehub/icons'

// AI 工具名称 → Lobe Icon 组件映射
const TOOL_ICON_MAP = {
  'Cursor': Cursor,
  'Claude Code': ClaudeCode,
  'Codex': Codex,
  'Windsurf': Windsurf,
  'Cline': Cline,
  'OpenClaw': OpenClaw,
  'Hermes Agent': HermesAgent,
  'KiloCode': KiloCode,
  'OpenCode': OpenCode,
}

// AI 模型名称 → Lobe Icon 组件映射
const MODEL_ICON_MAP = {
  'Claude': Claude,
  'GPT': OpenAI,
  'Gemini': Gemini,
  'DeepSeek': DeepSeek,
  'MiniMax': Minimax,
  '豆包': Doubao,
  'MiMo': XiaomiMiMo,
}

// 通用名称（网站/服务）→ Lobe Icon 组件映射
const BRAND_ICON_MAP = {
  'Stitch': Google,
  '千问': Qwen,
  '扣子APP': Coze,
  '悟空': Doubao,
  'ArkClaw': OpenClaw,
  '讯飞同传': IFlyTekCloud,
  '讯飞译制': IFlyTekCloud,
  // MCP servers
  'GitHub MCP Server': Github,
  'GitLab MCP Server': Github,
  'Notion MCP Server': Notion,
  'Playwright MCP Server': MCP,
  'Chrome DevTools MCP Server': Google,
}

/**
 * 获取 AI 工具对应的 Lobe Icon 组件
 * @param {string} toolName - 工具名称 (如 'Cursor', 'Claude Code')
 * @returns {React.ComponentType|null}
 */
export function getToolIcon(toolName) {
  return TOOL_ICON_MAP[toolName] || null
}

/**
 * 获取 AI 模型对应的 Lobe Icon 组件
 * @param {string} modelName - 模型名称
 * @returns {React.ComponentType|null}
 */
export function getModelIcon(modelName) {
  return MODEL_ICON_MAP[modelName] || null
}

/**
 * 获取品牌/服务对应的 Lobe Icon 组件
 * @param {string} name - 名称
 * @returns {React.ComponentType|null}
 */
export function getBrandIcon(name) {
  return BRAND_ICON_MAP[name] || null
}
