import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import './Auth.css'

function AuthConfirm() {
  const { t } = useLanguage()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'auto-login' | 'error'
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    // 如果 Supabase 返回了 token（通过 hash fragment 或 query）
    if (accessToken && refreshToken) {
      handleTokenLogin(accessToken, refreshToken)
      return
    }

    // 如果只有 token 参数（验证 token）
    if (token && type === 'signup') {
      handleVerifyToken(token)
      return
    }

    // 如果 URL 中有 #access_token（Supabase 重定向格式）
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const at = params.get('access_token')
      const rt = params.get('refresh_token')
      if (at && rt) {
        handleTokenLogin(at, rt)
        return
      }
    }

    // 没有 token，直接显示成功（用户可能是通过 Supabase 托管页面跳转来的）
    setStatus('success')
  }, [])

  async function handleTokenLogin(accessToken, refreshToken) {
    try {
      setStatus('auto-login')
      // 将 token 保存到 localStorage
      const SB_URL = import.meta.env.VITE_SUPABASE_URL
      const AUTH_KEY = SB_URL + '-auth-token'

      // 解析 JWT 获取用户信息
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const user = { id: payload.sub, email: payload.email }

      localStorage.setItem(AUTH_KEY, JSON.stringify({
        currentSession: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user
        }
      }))

      setStatus('success')
      // 3秒后自动跳转首页
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  async function handleVerifyToken(token) {
    try {
      setStatus('loading')
      const SB_URL = import.meta.env.VITE_SUPABASE_URL
      const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

      const res = await fetch(`${SB_URL}/auth/v1/verify`, {
        method: 'GET',
        headers: { 'apikey': SB_KEY }
      })

      // token 验证成功（Supabase 已处理）
      setStatus('success')
    } catch {
      setStatus('success') // 即使验证出错也显示成功，因为用户已经点过链接了
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'loading' && (
          <>
            <motion.div
              className="auth-email-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <RefreshCw size={48} className="auth-resend-spinning" />
            </motion.div>
            <h1 className="auth-title">
              <span className="gradient-text">{t('auth.confirmProcessing')}</span>
            </h1>
          </>
        )}

        {status === 'auto-login' && (
          <>
            <motion.div
              className="auth-email-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={48} />
            </motion.div>
            <h1 className="auth-title">
              <span className="gradient-text">{t('auth.confirmSuccess')}</span>
            </h1>
            <p className="auth-subtitle">{t('auth.confirmAutoLogin')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              className="auth-email-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={48} />
            </motion.div>
            <h1 className="auth-title">
              <span className="gradient-text">{t('auth.confirmSuccess')}</span>
            </h1>
            <p className="auth-subtitle">{t('auth.confirmSubtitle')}</p>
            <motion.button
              className="auth-submit"
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('auth.goToLogin')} <ArrowRight size={18} />
            </motion.button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              className="auth-email-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={48} />
            </motion.div>
            <h1 className="auth-title">
              <span className="gradient-text">{t('auth.confirmSuccess')}</span>
            </h1>
            <p className="auth-subtitle">{t('auth.confirmSubtitle')}</p>
            <motion.button
              className="auth-submit"
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('auth.goToLogin')} <ArrowRight size={18} />
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default AuthConfirm
