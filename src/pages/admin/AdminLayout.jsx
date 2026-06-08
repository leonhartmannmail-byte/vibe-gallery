import { useState } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, Image, Star, Users, Compass, MessageSquare, 
  Server, Wrench, Settings, Shield, Home, Menu, X, ChevronLeft
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '仪表盘', exact: true },
  { path: '/admin/works', icon: Image, label: '作品管理' },
  { path: '/admin/recommendations', icon: Star, label: '作品推荐' },
  { path: '/admin/accounts', icon: Users, label: '账号管理' },
  { type: 'divider', label: '首页内容' },
  { path: '/admin/nav-sites', icon: Compass, label: '导航网站' },
  { path: '/admin/prompts', icon: MessageSquare, label: 'AI 提示词' },
  { path: '/admin/mcp', icon: Server, label: 'MCP 服务' },
  { path: '/admin/skills', icon: Wrench, label: 'Skills 技能' },
  { type: 'divider', label: '系统' },
  { path: '/admin/home-config', icon: Settings, label: '首页配置' },
  { path: '/admin/site-config', icon: Shield, label: '登录配置' },
]

function AdminLayout() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>加载中...</span>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  function isActive(path, exact) {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="admin-layout">
      {/* Mobile header */}
      <div className="admin-mobile-header">
        <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="admin-mobile-title">管理后台</span>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''} ${mobileMenuOpen ? 'admin-sidebar--mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo">
            <span className="gradient-text">Vibe Coding</span>
            {!sidebarCollapsed && <span className="admin-sidebar-badge">Admin</span>}
          </Link>
          <button 
            className="admin-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotated-180' : ''} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item, i) => {
            if (item.type === 'divider') {
              return !sidebarCollapsed ? (
                <div key={i} className="admin-nav-divider">
                  <span>{item.label}</span>
                </div>
              ) : <div key={i} className="admin-nav-divider-line" />
            }
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${active ? 'admin-nav-item--active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <Home size={18} />
            {!sidebarCollapsed && <span>返回前台</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="admin-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
