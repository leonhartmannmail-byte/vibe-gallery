import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, User, Sun, Moon, Compass, Shield } from 'lucide-react'
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

  async function handleSignOut() {
    await signOut()
    setShowMenu(false)
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
    </motion.nav>
  )
}

export default Navbar
