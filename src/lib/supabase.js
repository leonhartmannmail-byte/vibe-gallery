import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失！请检查 .env 文件')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  }
})

// 从 localStorage 读取 access_token（不依赖 Supabase 客户端）
function getLocalToken() {
  try {
    const raw = localStorage.getItem(supabaseUrl + '-auth-token')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession || parsed
    return session?.access_token || null
  } catch {
    return null
  }
}

// 直接 fetch 查询 Supabase REST API（绕过有问题的客户端）
export async function sbQuery(table, { method = 'GET', params = '', body = null } = {}) {
  const token = getLocalToken() || supabaseAnonKey

  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/${table}${params}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `请求失败 (${res.status})`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}
