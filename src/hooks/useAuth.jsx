import { useState, useEffect, createContext, useContext } from 'react'
import { sbQuery } from '../lib/supabase'

const SB_URL = import.meta.env.VITE_SUPABASE_URL
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const AUTH_KEY = SB_URL + '-auth-token'

const AuthContext = createContext(null)

// 从 localStorage 读取 session（不依赖 Supabase 客户端）
function getLocalSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession || parsed
    const token = session?.access_token
    if (!token) return null
    // 检查是否过期
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) return null
    return session
  } catch {
    return null
  }
}

// 用 raw fetch 调 Supabase Auth API
async function sbAuth(endpoint, body) {
  const res = await fetch(`${SB_URL}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || '请求失败')
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 先检查是否是 OAuth 回调
    handleOAuthCallback().then((handled) => {
      if (handled) {
        setLoading(false)
        return
      }
      // 否则读本地 session
      const session = getLocalSession()
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function fetchProfile(userId) {
    try {
      const data = await sbQuery('profiles', {
        params: `?select=*&id=eq.${userId}`
      })
      setProfile(data?.[0] || null)
    } catch (error) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  function saveSession(session) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ currentSession: session }))
  }

  function clearSession() {
    localStorage.removeItem(AUTH_KEY)
  }

  async function signUp(email, password, username) {
    try {
      const data = await sbAuth('signup', {
        email,
        password,
        data: { username }
      })
      if (data.session) {
        saveSession(data.session)
        setUser(data.user)
        await fetchProfile(data.user.id)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  async function signIn(email, password) {
    try {
      const data = await sbAuth('token?grant_type=password', {
        email,
        password
      })
      // Supabase 返回的数据格式：{ access_token, user, ... }（没有 session 字段）
      const session = data.access_token ? data : data.session
      if (session?.access_token) {
        saveSession({ ...session, user: data.user })
        setUser(data.user)
        await fetchProfile(data.user.id)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  // OAuth 一键登录（Google / GitHub）
  function signInWithOAuth(provider) {
    const redirectTo = `${window.location.origin}/auth`
    window.location.href =
      `${SB_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`
  }

  // 处理 OAuth 回调（URL hash 中包含 access_token）
  async function handleOAuthCallback() {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return false
    try {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (!access_token) return false

      // 用 token 获取用户信息
      const res = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${access_token}`
        }
      })
      if (!res.ok) return false
      const userData = await res.json()

      const session = {
        access_token,
        refresh_token,
        user: userData
      }
      saveSession(session)
      setUser(userData)
      await fetchProfile(userData.id)

      // 清除 URL hash
      window.history.replaceState({}, '', window.location.pathname)
      return true
    } catch {
      return false
    }
  }

  async function signOut() {
    clearSession()
    setUser(null)
    setProfile(null)
    return { error: null }
  }

  async function updateProfile(updates) {
    if (!user) return { error: '未登录' }
    try {
      const data = await sbQuery('profiles', {
        method: 'PATCH',
        params: `?select=*&id=eq.${user.id}`,
        body: updates
      })
      const result = data?.[0] || null
      setProfile(result)
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
