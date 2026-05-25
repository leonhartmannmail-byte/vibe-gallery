import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import './Auth.css'

function Auth() {
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'check-email' | 'reset-password'
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          if (error.message?.includes('Email not confirmed')) {
            setError(t('auth.emailNotVerified'))
          } else if (error.message?.includes('Invalid login credentials')) {
            setError(t('auth.invalidCredentials'))
          } else {
            throw error
          }
          setLoading(false)
          return
        }
        navigate('/')
      } else {
        if (!username.trim()) {
          setError(t('auth.usernameRequired'))
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, username.trim())
        if (error) {
          if (error.message?.includes('already registered')) {
            setError(t('auth.alreadyRegistered'))
            setIsLogin(true)
          } else {
            throw error
          }
          setLoading(false)
          return
        }
        setStep('check-email')
      }
    } catch (err) {
      setError(err.message || t('auth.operationFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, redirect_to: window.location.origin })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error_description || err.msg || '发送失败')
      }
      setStep('reset-sent')
    } catch (err) {
      setError(err.message || t('auth.sendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    setResendDone(false)
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'signup', email })
      })
      setResendDone(true)
    } catch {
      // 忽略错误
    } finally {
      setResendLoading(false)
    }
  }

  function goToForm(mode) {
    setStep('form')
    setIsLogin(mode === 'login')
    setError('')
    setResendDone(false)
  }

  // ===== 注册成功 - 查收邮件 =====
  if (step === 'check-email') {
    return (
      <div className="auth-page">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth-email-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <Mail size={48} />
          </motion.div>
          <h1 className="auth-title"><span className="gradient-text">{t('auth.checkEmailTitle')}</span></h1>
          <p className="auth-subtitle">{t('auth.checkEmailSubtitle', { email })}</p>
          <div className="auth-email-steps">
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepOpenEmail')}</span></div>
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepClickLink')}</span></div>
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepReturnLogin')}</span></div>
          </div>
          <motion.button className="auth-submit" onClick={() => goToForm('login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {t('auth.goToLogin')} <ArrowRight size={18} />
          </motion.button>
          <div className="auth-resend">
            <span>{t('auth.noEmail')}</span>
            <button type="button" className="auth-resend-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? <RefreshCw size={14} className="auth-resend-spinning" /> : <RefreshCw size={14} />}
              {resendDone ? t('auth.resent') : t('auth.resend')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ===== 忘记密码 - 输入邮箱 =====
  if (step === 'reset-password') {
    return (
      <div className="auth-page">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth-email-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <Lock size={48} />
          </motion.div>
          <h1 className="auth-title"><span className="gradient-text">{t('auth.resetPasswordTitle')}</span></h1>
          <p className="auth-subtitle">{t('auth.resetPasswordSubtitle')}</p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <motion.button type="submit" className="auth-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <p className="auth-switch">
            <button type="button" className="auth-switch-btn" onClick={() => goToForm('login')}>{t('auth.backToLogin')}</button>
          </p>
        </motion.div>
      </div>
    )
  }

  // ===== 忘记密码 - 已发送 =====
  if (step === 'reset-sent') {
    return (
      <div className="auth-page">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth-email-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <CheckCircle size={48} />
          </motion.div>
          <h1 className="auth-title"><span className="gradient-text">{t('auth.emailSentTitle')}</span></h1>
          <p className="auth-subtitle">{t('auth.emailSentSubtitle', { email })}</p>
          <div className="auth-email-steps">
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepClickResetLink')}</span></div>
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepSetNewPassword')}</span></div>
            <div className="auth-email-step"><CheckCircle size={16} /><span>{t('auth.stepReturnLogin2')}</span></div>
          </div>
          <motion.button className="auth-submit" onClick={() => goToForm('login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {t('auth.backToLogin')} <ArrowRight size={18} />
          </motion.button>
          <div className="auth-resend">
            <span>{t('auth.noEmail')}</span>
            <button type="button" className="auth-resend-btn" onClick={handleResetPassword} disabled={resendLoading}>
              {resendLoading ? <RefreshCw size={14} className="auth-resend-spinning" /> : <RefreshCw size={14} />}
              {t('auth.resend')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ===== 登录 / 注册表单 =====
  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="auth-title">
          <span className="gradient-text">{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</span>
        </h1>
        <p className="auth-subtitle">
          {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <motion.div className="input-group" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <User size={18} className="input-icon" />
              <input type="text" placeholder={t('auth.username')} value={username} onChange={(e) => setUsername(e.target.value)} required={!isLogin} />
            </motion.div>
          )}

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {isLogin && (
            <div className="auth-forgot">
              <button type="button" className="auth-forgot-btn" onClick={() => setStep('reset-password')}>
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          <motion.button type="submit" className="auth-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? t('auth.processing') : isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </form>

        <p className="auth-switch">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          <button type="button" className="auth-switch-btn" onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? t('auth.registerNow') : t('auth.goToLogin')}
          </button>
        </p>

        {isLogin && (
          <p className="auth-hint">
            {t('auth.registerHint')}
          </p>
        )}

        <p className="auth-privacy">
          {t('auth.privacyPrefix')}
          <Link to="/privacy" className="auth-privacy-link">{t('auth.privacyLink')}</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Auth
