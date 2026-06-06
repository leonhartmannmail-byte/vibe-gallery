import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, User, Sun, Moon, Compass, Shield, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useLanguage } from '../../hooks/useLanguage'
import './Navbar.css'

function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { locale, t, toggleLocale } = useLanguage()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const avatarRef = useRef(null)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!showMenu) return
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMenu])

  // 移动端菜单打开时禁止背景滚动
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showMobileMenu])

  async function handleSignOut() {
    await signOut()
    setShowMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="gradient-text">Vibe Coding</span>
          </Link>
          <Link to="/explore" className="navbar-explore-link">
            <Compass size={16} />
            <span>{t('navbar.explore')}</span>
          </Link>
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="navbar-actions">
          <button className="navbar-theme-btn" onClick={toggleTheme} title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="navbar-lang-btn" onClick={toggleLocale}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>

          {loading ? (
            <div className="navbar-loading" />
          ) : user ? (
            <>
              <Link to="/publish" className="navbar-publish-btn">
                <Plus size={18} />
                <span>{t('navbar.publish')}</span>
              </Link>

              <div className="navbar-avatar-wrap" ref={avatarRef}>
                <button
                  className="navbar-avatar"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    <div className="navbar-avatar-placeholder">
                      {(profile?.username || user.email)[0].toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      className="navbar-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="navbar-dropdown-header">
                        <span className="navbar-dropdown-name">
                          {profile?.username || t('navbar.user')}
                        </span>
                        <span className="navbar-dropdown-email">
                          {user.email}
                        </span>
                      </div>
                      <div className="navbar-dropdown-divider" />
                      <Link
                        to={`/profile/${user.id}`}
                        className="navbar-dropdown-item"
                        onClick={() => setShowMenu(false)}
                      >
                        <User size={16} />
                        {t('navbar.profile')}
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="navbar-dropdown-item"
                          onClick={() => setShowMenu(false)}
                        >
                          <Shield size={16} />
                          管理后台
                        </Link>
                      )}
                      <button
                        className="navbar-dropdown-item navbar-dropdown-item--danger"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} />
                        {t('navbar.signOut')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/auth" className="navbar-login-btn">
              {t('navbar.login')}
            </Link>
          )}
        </div>
      </div>

      {/* 移动端全屏菜单 */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="navbar-mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="navbar-mobile-menu-inner">
              <Link to="/explore" className="navbar-mobile-link" onClick={() => setShowMobileMenu(false)}>
                <Compass size={18} />
                {t('navbar.explore')}
              </Link>

              {user ? (
                <>
                  <Link to="/publish" className="navbar-mobile-link" onClick={() => setShowMobileMenu(false)}>
                    <Plus size={18} />
                    {t('navbar.publish')}
                  </Link>
                  <Link to={`/profile/${user.id}`} className="navbar-mobile-link" onClick={() => setShowMobileMenu(false)}>
                    <User size={18} />
                    {t('navbar.profile')}
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="navbar-mobile-link" onClick={() => setShowMobileMenu(false)}>
                      <Shield size={18} />
                      管理后台
                    </Link>
                  )}
                  <div className="navbar-mobile-divider" />
                  <button className="navbar-mobile-link navbar-mobile-link--danger" onClick={handleSignOut}>
                    <LogOut size={18} />
                    {t('navbar.signOut')}
                  </button>
                </>
              ) : (
                <Link to="/auth" className="navbar-mobile-link" onClick={() => setShowMobileMenu(false)}>
                  {t('navbar.login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
