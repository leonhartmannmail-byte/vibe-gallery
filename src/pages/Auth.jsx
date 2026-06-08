import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, CheckCircle, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { sbQuery } from '../lib/supabase'
import './Auth.css'

/* ========== 动画角色组件 ========== */

function Pupil({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }) {
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { setMx(e.clientX); setMy(e.clientY) }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const calcPos = () => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mx - cx, dy = my - cy
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  }
  const pos = calcPos()

  return (
    <div
      ref={ref}
      style={{
        width: size, height: size, borderRadius: '50%', backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out',
      }}
    />
  )
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }) {
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { setMx(e.clientX); setMy(e.clientY) }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const calcPos = () => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mx - cx, dy = my - cy
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  }
  const pos = calcPos()

  return (
    <div
      ref={ref}
      style={{
        width: size, height: isBlinking ? 2 : size, borderRadius: '50%',
        backgroundColor: eyeColor, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'height 0.15s ease',
      }}
    >
      {!isBlinking && (
        <div style={{
          width: pupilSize, height: pupilSize, borderRadius: '50%', backgroundColor: pupilColor,
          transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out',
        }} />
      )}
    </div>
  )
}

/* ========== 主组件 ========== */

function Auth() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form')

  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [oauthConfig, setOauthConfig] = useState({ google: false, github: false })
  const { signIn, signUp, signInWithOAuth, user: authUser } = useAuth()
  const navigate = useNavigate()

  // 已登录用户直接跳转首页
  useEffect(() => {
    if (authUser) {
      navigate('/')
    }
  }, [authUser])

  // 读取 OAuth 登录开关配置
  useEffect(() => {
    sbQuery('site_config', { params: '?select=config_key,config_value' })
      .then(rows => {
        const cfg = { google: false, github: false }
        ;(rows || []).forEach(r => {
          if (r.config_key === 'oauth_google_enabled') cfg.google = r.config_value === true
          if (r.config_key === 'oauth_github_enabled') cfg.github = r.config_value === true
        })
        setOauthConfig(cfg)
      })
      .catch(() => {})
  }, [])

  const showOAuth = oauthConfig.google || oauthConfig.github

  // 动画状态
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false)
  const [isBlackBlinking, setIsBlackBlinking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking] = useState(false)
  const purpleRef = useRef(null)
  const blackRef = useRef(null)
  const yellowRef = useRef(null)
  const orangeRef = useRef(null)

  // 邮箱验证跳转
  const confirmed = searchParams.get('confirmed')
  const [showConfirmed, setShowConfirmed] = useState(confirmed === 'true')

  useEffect(() => {
    if (confirmed === 'true') {
      setShowConfirmed(true)
      window.history.replaceState({}, '', '/auth')
    }
  }, [confirmed])

  // 鼠标追踪
  useEffect(() => {
    const handler = (e) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // 紫色角色眨眼
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true)
        setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink() }, 150)
      }, Math.random() * 4000 + 3000)
      return t
    }
    const timer = scheduleBlink()
    return () => clearTimeout(timer)
  }, [])

  // 黑色角色眨眼
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true)
        setTimeout(() => { setIsBlackBlinking(false); scheduleBlink() }, 150)
      }, Math.random() * 4000 + 3000)
      return t
    }
    const timer = scheduleBlink()
    return () => clearTimeout(timer)
  }, [])

  // 输入时互相看
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true)
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800)
      return () => clearTimeout(timer)
    }
    setIsLookingAtEachOther(false)
  }, [isTyping])

  // 密码可见时紫色偷看
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const timer = setTimeout(() => {
        setIsPurplePeeking(true)
        setTimeout(() => setIsPurplePeeking(false), 800)
      }, Math.random() * 3000 + 2000)
      return () => clearTimeout(timer)
    }
    setIsPurplePeeking(false)
  }, [password, showPassword, isPurplePeeking])

  // 计算角色位置
  const calcCharPos = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 3
    const dx = mouseX - cx, dy = mouseY - cy
    const faceX = Math.max(-15, Math.min(15, dx / 20))
    const faceY = Math.max(-10, Math.min(10, dy / 30))
    const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
    return { faceX, faceY, bodySkew }
  }
  const pPos = calcCharPos(purpleRef)
  const bPos = calcCharPos(blackRef)
  const yPos = calcCharPos(yellowRef)
  const oPos = calcCharPos(orangeRef)

  const pwdVisible = password.length > 0 && showPassword
  const pwdHidden = password.length > 0 && !showPassword

  /* ---- Supabase Auth ---- */

  function handleOAuth(provider) {
    setError('')
    setOauthLoading(provider)
    signInWithOAuth(provider)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          if (error.message?.includes('Email not confirmed')) setError(t('auth.emailNotVerified'))
          else if (error.message?.includes('Invalid login credentials')) setError(t('auth.invalidCredentials'))
          else throw error
          setLoading(false)
          return
        }
        navigate('/')
      } else {
        if (!username.trim()) { setError(t('auth.usernameRequired')); setLoading(false); return }
        const { error } = await signUp(email, password, username.trim())
        if (error) {
          if (error.message?.includes('already registered')) { setError(t('auth.alreadyRegistered')); setIsLogin(true) }
          else throw error
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
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
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
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'signup', email })
      })
      setResendDone(true)
    } catch { /* ignore */ }
    finally { setResendLoading(false) }
  }

  function goToForm(mode) {
    setStep('form')
    setIsLogin(mode === 'login')
    setError('')
    setResendDone(false)
  }

  /* ========== 查收邮件页 ========== */
  if (step === 'check-email') {
    return (
      <AuthLayout characters={<AnimatedCharacters isTyping={false} pwdVisible={false} pwdHidden={false} isPurpleBlinking={isPurpleBlinking} isBlackBlinking={isBlackBlinking} isLookingAtEachOther={false} isPurplePeeking={false} pPos={pPos} bPos={bPos} yPos={yPos} oPos={oPos} purpleRef={purpleRef} blackRef={blackRef} yellowRef={yellowRef} orangeRef={orangeRef} mouseX={0} mouseY={0} />}>
        <motion.div className="auth2-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth2-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <Mail size={40} />
          </motion.div>
          <h1 className="auth2-title"><span className="gradient-text">{t('auth.checkEmailTitle')}</span></h1>
          <p className="auth2-sub">{t('auth.checkEmailSubtitle', { email })}</p>
          <div className="auth2-steps">
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepOpenEmail')}</span></div>
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepClickLink')}</span></div>
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepReturnLogin')}</span></div>
          </div>
          <button className="auth2-submit" onClick={() => goToForm('login')}>
            {t('auth.goToLogin')} <ArrowRight size={18} />
          </button>
          <div className="auth2-resend">
            <span>{t('auth.noEmail')}</span>
            <button type="button" className="auth2-resend-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? <RefreshCw size={14} className="auth2-spin" /> : <RefreshCw size={14} />}
              {resendDone ? t('auth.resent') : t('auth.resend')}
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  /* ========== 重置密码页 ========== */
  if (step === 'reset-password') {
    return (
      <AuthLayout characters={<AnimatedCharacters isTyping={false} pwdVisible={false} pwdHidden={false} isPurpleBlinking={isPurpleBlinking} isBlackBlinking={isBlackBlinking} isLookingAtEachOther={false} isPurplePeeking={false} pPos={pPos} bPos={bPos} yPos={yPos} oPos={oPos} purpleRef={purpleRef} blackRef={blackRef} yellowRef={yellowRef} orangeRef={orangeRef} mouseX={0} mouseY={0} />}>
        <motion.div className="auth2-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth2-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <Lock size={40} />
          </motion.div>
          <h1 className="auth2-title"><span className="gradient-text">{t('auth.resetPasswordTitle')}</span></h1>
          <p className="auth2-sub">{t('auth.resetPasswordSubtitle')}</p>
          <AnimatePresence mode="wait">
            {error && <motion.div className="auth2-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{error}</motion.div>}
          </AnimatePresence>
          <form className="auth2-form" onSubmit={handleResetPassword}>
            <div className="auth2-input-group">
              <Mail size={18} className="auth2-input-icon" />
              <input type="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="auth2-submit" disabled={loading}>
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="auth2-switch">
            <button type="button" className="auth2-switch-btn" onClick={() => goToForm('login')}>{t('auth.backToLogin')}</button>
          </p>
        </motion.div>
      </AuthLayout>
    )
  }

  /* ========== 重置已发送 ========== */
  if (step === 'reset-sent') {
    return (
      <AuthLayout characters={<AnimatedCharacters isTyping={false} pwdVisible={false} pwdHidden={false} isPurpleBlinking={isPurpleBlinking} isBlackBlinking={isBlackBlinking} isLookingAtEachOther={false} isPurplePeeking={false} pPos={pPos} bPos={bPos} yPos={yPos} oPos={oPos} purpleRef={purpleRef} blackRef={blackRef} yellowRef={yellowRef} orangeRef={orangeRef} mouseX={0} mouseY={0} />}>
        <motion.div className="auth2-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="auth2-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <CheckCircle size={40} />
          </motion.div>
          <h1 className="auth2-title"><span className="gradient-text">{t('auth.emailSentTitle')}</span></h1>
          <p className="auth2-sub">{t('auth.emailSentSubtitle', { email })}</p>
          <div className="auth2-steps">
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepClickResetLink')}</span></div>
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepSetNewPassword')}</span></div>
            <div className="auth2-step"><CheckCircle size={16} /><span>{t('auth.stepReturnLogin2')}</span></div>
          </div>
          <button className="auth2-submit" onClick={() => goToForm('login')}>
            {t('auth.backToLogin')} <ArrowRight size={18} />
          </button>
          <div className="auth2-resend">
            <span>{t('auth.noEmail')}</span>
            <button type="button" className="auth2-resend-btn" onClick={handleResetPassword} disabled={resendLoading}>
              {resendLoading ? <RefreshCw size={14} className="auth2-spin" /> : <RefreshCw size={14} />}
              {t('auth.resend')}
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  /* ========== 登录/注册表单 ========== */
  return (
    <AuthLayout characters={
      <AnimatedCharacters
        isTyping={isTyping} pwdVisible={pwdVisible} pwdHidden={pwdHidden}
        isPurpleBlinking={isPurpleBlinking} isBlackBlinking={isBlackBlinking}
        isLookingAtEachOther={isLookingAtEachOther} isPurplePeeking={isPurplePeeking}
        pPos={pPos} bPos={bPos} yPos={yPos} oPos={oPos}
        purpleRef={purpleRef} blackRef={blackRef} yellowRef={yellowRef} orangeRef={orangeRef}
        mouseX={mouseX} mouseY={mouseY}
      />
    }>
      <motion.div className="auth2-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* 移动端 logo */}
        <div className="auth2-mobile-logo">
          <Sparkles size={16} />
          <span>Vibe Coding</span>
        </div>

        <h1 className="auth2-title">
          <span className="gradient-text">{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</span>
        </h1>
        <p className="auth2-sub">
          {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
        </p>

        <AnimatePresence mode="wait">
          {showConfirmed && (
            <motion.div className="auth2-confirmed" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <CheckCircle size={16} /> {t('auth.confirmSuccess')} {t('auth.confirmSubtitle')}
            </motion.div>
          )}
          {error && (
            <motion.div className="auth2-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="auth2-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth2-input-group">
              <User size={18} className="auth2-input-icon" />
              <input type="text" placeholder={t('auth.username')} value={username} onChange={(e) => setUsername(e.target.value)} required={!isLogin} />
            </div>
          )}

          <div className="auth2-input-group">
            <Mail size={18} className="auth2-input-icon" />
            <input
              type="email" placeholder={t('auth.email')} value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              required
            />
          </div>

          <div className="auth2-input-group">
            <Lock size={18} className="auth2-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.password')} value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              required minLength={6}
            />
            <button type="button" className="auth2-eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isLogin && (
            <div className="auth2-forgot">
              <button type="button" className="auth2-forgot-btn" onClick={() => setStep('reset-password')}>
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          <button type="submit" className="auth2-submit" disabled={loading}>
            {loading ? t('auth.processing') : isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* OAuth 一键登录 — 由管理后台控制显示 */}
        {showOAuth && (
          <>
            <div className="auth2-divider">
              <span className="auth2-divider-line" />
              <span className="auth2-divider-text">{t('auth.orContinueWith')}</span>
              <span className="auth2-divider-line" />
            </div>

            <div className="auth2-oauth">
              {oauthConfig.google && (
                <button
                  type="button"
                  className="auth2-oauth-btn"
                  onClick={() => handleOAuth('google')}
                  disabled={!!oauthLoading}
                >
                  {oauthLoading === 'google' ? (
                    <span className="auth2-spin">{/* spinner */}</span>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  <span>{oauthLoading === 'google' ? t('auth.oauthRedirecting') : t('auth.continueWithGoogle')}</span>
                </button>
              )}

              {oauthConfig.github && (
                <button
                  type="button"
                  className="auth2-oauth-btn"
                  onClick={() => handleOAuth('github')}
                  disabled={!!oauthLoading}
                >
                  {oauthLoading === 'github' ? (
                    <span className="auth2-spin">{/* spinner */}</span>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  <span>{oauthLoading === 'github' ? t('auth.oauthRedirecting') : t('auth.continueWithGithub')}</span>
                </button>
              )}
            </div>
          </>
        )}

        <p className="auth2-switch">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          <button type="button" className="auth2-switch-btn" onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? t('auth.registerNow') : t('auth.goToLogin')}
          </button>
        </p>

        {isLogin && <p className="auth2-hint">{t('auth.registerHint')}</p>}

        <p className="auth2-privacy">
          {t('auth.privacyPrefix')}
          <Link to="/privacy" className="auth2-privacy-link">{t('auth.privacyLink')}</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}

/* ========== 布局容器 ========== */
function AuthLayout({ characters, children }) {
  return (
    <div className="auth2-page">
      {/* 左侧：动画角色面板 */}
      <div className="auth2-left">
        <div className="auth2-left-inner">
          <div className="auth2-brand">
            <div className="auth2-brand-icon"><Sparkles size={16} /></div>
            <span>Vibe Coding</span>
          </div>
          <div className="auth2-characters-stage">
            {characters}
          </div>
          <div className="auth2-left-footer">
            <Link to="/privacy">Privacy</Link>
            <span>·</span>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="auth2-left-grid" />
        <div className="auth2-left-glow auth2-left-glow--1" />
        <div className="auth2-left-glow auth2-left-glow--2" />
      </div>

      {/* 右侧：表单 */}
      <div className="auth2-right">
        {children}
      </div>
    </div>
  )
}

/* ========== 动画角色场景 ========== */
function AnimatedCharacters({
  isTyping, pwdVisible, pwdHidden,
  isPurpleBlinking, isBlackBlinking,
  isLookingAtEachOther, isPurplePeeking,
  pPos, bPos, yPos, oPos,
  purpleRef, blackRef, yellowRef, orangeRef,
}) {
  return (
    <div className="auth2-char-wrapper">
      {/* 紫色高个 */}
      <div
        ref={purpleRef}
        className="auth2-char auth2-char--purple"
        style={{
          height: (isTyping || pwdHidden) ? 440 : 400,
          transform: pwdVisible
            ? 'skewX(0deg)'
            : (isTyping || pwdHidden)
              ? `skewX(${(pPos.bodySkew || 0) - 12}deg) translateX(40px)`
              : `skewX(${pPos.bodySkew || 0}deg)`,
        }}
      >
        <div className="auth2-char-eyes" style={{
          left: pwdVisible ? 20 : isLookingAtEachOther ? 55 : `${42 + pPos.faceX}px`,
          top: pwdVisible ? 35 : isLookingAtEachOther ? 65 : `${40 + pPos.faceY}px`,
        }}>
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={isPurpleBlinking}
            forceLookX={pwdVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={pwdVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={isPurpleBlinking}
            forceLookX={pwdVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={pwdVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
        </div>
      </div>

      {/* 黑色中个 */}
      <div
        ref={blackRef}
        className="auth2-char auth2-char--black"
        style={{
          transform: pwdVisible
            ? 'skewX(0deg)'
            : isLookingAtEachOther
              ? `skewX(${(bPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
              : (isTyping || pwdHidden)
                ? `skewX(${(bPos.bodySkew || 0) * 1.5}deg)`
                : `skewX(${bPos.bodySkew || 0}deg)`,
        }}
      >
        <div className="auth2-char-eyes" style={{
          left: pwdVisible ? 10 : isLookingAtEachOther ? 32 : `${26 + bPos.faceX}px`,
          top: pwdVisible ? 28 : isLookingAtEachOther ? 12 : `${32 + bPos.faceY}px`,
        }}>
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={isBlackBlinking}
            forceLookX={pwdVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={pwdVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={isBlackBlinking}
            forceLookX={pwdVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={pwdVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
        </div>
      </div>

      {/* 橙色半圆 */}
      <div
        ref={orangeRef}
        className="auth2-char auth2-char--orange"
        style={{
          transform: pwdVisible ? 'skewX(0deg)' : `skewX(${oPos.bodySkew || 0}deg)`,
        }}
      >
        <div className="auth2-char-eyes" style={{
          left: pwdVisible ? 35 : `${55 + (oPos.faceX || 0)}px`,
          top: pwdVisible ? 75 : `${75 + (oPos.faceY || 0)}px`,
        }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={pwdVisible ? -5 : undefined} forceLookY={pwdVisible ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={pwdVisible ? -5 : undefined} forceLookY={pwdVisible ? -4 : undefined} />
        </div>
      </div>

      {/* 黄色圆顶 */}
      <div
        ref={yellowRef}
        className="auth2-char auth2-char--yellow"
        style={{
          transform: pwdVisible ? 'skewX(0deg)' : `skewX(${yPos.bodySkew || 0}deg)`,
        }}
      >
        <div className="auth2-char-eyes" style={{
          left: pwdVisible ? 15 : `${42 + (yPos.faceX || 0)}px`,
          top: pwdVisible ? 30 : `${35 + (yPos.faceY || 0)}px`,
        }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={pwdVisible ? -5 : undefined} forceLookY={pwdVisible ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
            forceLookX={pwdVisible ? -5 : undefined} forceLookY={pwdVisible ? -4 : undefined} />
        </div>
        {/* 嘴巴 */}
        <div className="auth2-char-mouth" style={{
          left: pwdVisible ? 8 : `${35 + (yPos.faceX || 0)}px`,
          top: pwdVisible ? 80 : `${82 + (yPos.faceY || 0)}px`,
        }} />
      </div>
    </div>
  )
}

export default Auth
