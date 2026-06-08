import {
  // AI Coding IDEs & Assistants
  Cursor, ClaudeCode, Codex, Windsurf, Cline, OpenClaw,
  HermesAgent, KiloCode, OpenCode,
  Trae, Qoder, Devin, Lovable, V0, RooCode, Kiro, Amp,
  Goose, Replit, Zencoder, GithubCopilot, CodeGeeX,
  CodeBuddy, Junie,
  // AI Models / Providers
  Claude, OpenAI, Gemini, DeepSeek, Minimax, Doubao, XiaomiMiMo,
  Qwen, Coze, Google, Grok, Mistral, Meta, Wenxin, ZeroOne,
  Baichuan, Zhipu, InternLM, Cohere, Groq, Yi,
  // General brands / services
  Github, Notion, MCP, IFlyTekCloud,
  Aws, Bing, Perplexity, Kimi, Spark, Hunyuan, Tiangong,
} from '@lobehub/icons'

// AI 工具名称 → Lobe Icon 组件映射（AI开发平台/编程工具）
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
  // --- 新增 AI 开发工具 ---
  'Trae': Trae,
  'Qoder': Qoder,
  'Devin': Devin,
  'Lovable': Lovable,
  'v0': V0,
  'Roo Code': RooCode,
  'Kiro': Kiro,
  'Amp': Amp,
  'Goose': Goose,
  'Replit AI': Replit,
  'Continue': OpenCode,
  'Zencoder': Zencoder,
  'GitHub Copilot': GithubCopilot,
  'CodeGeeX': CodeGeeX,
  'CodeBuddy': CodeBuddy,
  'Junie': Junie,
  'Augment Code': Amp,
  'Amazon Q Developer': Aws,
  'Supermaven': Codex,
}

// AI 模型名称 → Lobe Icon 组件映射（AI大模型/底层模型）
const MODEL_ICON_MAP = {
  'Claude': Claude,
  'GPT': OpenAI,
  'Gemini': Gemini,
  'DeepSeek': DeepSeek,
  'MiniMax': Minimax,
  '豆包': Doubao,
  'MiMo': XiaomiMiMo,
  // --- 新增底层模型 ---
  'ChatGPT': OpenAI,
  'Grok': Grok,
  'Kimi': Kimi,
  'Mistral AI': Mistral,
  'Llama': Meta,
  '文心一言': Wenxin,
  '零一万物': ZeroOne,
  'Baichuan AI': Baichuan,
  '智谱 AI': Zhipu,
  '书生 InternLM': InternLM,
  'Cohere': Cohere,
  'Groq': Groq,
  'Yi 零一万物': Yi,
  '讯飞星火认知大模型': Spark,
  '通义千问': Qwen,
  '腾讯混元': Hunyuan,
  '天工超能AI': Tiangong,
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
  // 搜索引擎
  'Perplexity': Perplexity,
  'Bing新必应': Bing,
  // AI开发工具（用于 nav_sites 卡片图标）
  'Trae': Trae,
  'Qoder': Qoder,
  'Devin': Devin,
  'Lovable': Lovable,
  'v0': V0,
  'Roo Code': RooCode,
  'Kiro': Kiro,
  'Amp': Amp,
  'Goose': Goose,
  'Replit AI': Replit,
  'Continue': OpenCode,
  'Zencoder': Zencoder,
  'GitHub Copilot': GithubCopilot,
  'Cursor': Cursor,
  'Windsurf': Windsurf,
  'Claude Code': ClaudeCode,
  // AI大模型（用于 nav_sites 卡片图标）
  'ChatGPT': OpenAI,
  'Gemini': Gemini,
  'Grok': Grok,
  'Claude': Claude,
  'Kimi': Kimi,
  'Mistral AI': Mistral,
  'Llama': Meta,
  '文心一言': Wenxin,
  '零一万物': ZeroOne,
  'Baichuan AI': Baichuan,
  '智谱 AI': Zhipu,
  '书生 InternLM': InternLM,
  'Cohere': Cohere,
  'Groq': Groq,
  'DeepSeek': DeepSeek,
  '通义千问': Qwen,
  'Yi 零一万物': Yi,
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

/**
 * 从 URL 提取域名，返回 Google Favicon 服务地址
 * @param {string} url - 网站 URL
 * @returns {string|null} favicon URL 或 null
 */
export function getFaviconUrl(url) {
  if (!url) return null
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}
