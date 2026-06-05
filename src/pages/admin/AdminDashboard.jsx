import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Image, Users, Compass, Server, ArrowRight, Star } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

function AdminDashboard() {
  const { fetchTable } = useAdmin()
  const [stats, setStats] = useState({ works: 0, users: 0, navSites: 0, mcpServers: 0 })
  const [recentWorks, setRecentWorks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [works, profiles, navSites, mcpServers, recent] = await Promise.all([
          fetchTable('works', 'select=id'),
          fetchTable('profiles', 'select=id'),
          fetchTable('nav_sites', 'select=id&is_active=eq.true'),
          fetchTable('mcp_servers', 'select=id&is_active=eq.true'),
          fetchTable('works', 'select=id,title,created_at,likes_count&order=created_at.desc&limit=5'),
        ])
        setStats({
          works: works?.length || 0,
          users: profiles?.length || 0,
          navSites: navSites?.length || 0,
          mcpServers: mcpServers?.length || 0,
        })
        setRecentWorks(recent || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchTable])

  const statCards = [
    { label: '作品总数', value: stats.works, icon: Image, link: '/admin/works' },
    { label: '注册用户', value: stats.users, icon: Users, link: '/admin/accounts' },
    { label: '导航网站', value: stats.navSites, icon: Compass, link: '/admin/nav-sites' },
    { label: 'MCP 服务', value: stats.mcpServers, icon: Server, link: '/admin/mcp' },
  ]

  if (loading) {
    return <div className="admin-empty">加载中...</div>
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">仪表盘</h1>
          <p className="admin-page-subtitle">管理后台概览</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <Link key={card.label} to={card.link} style={{ textDecoration: 'none' }}>
            <div className="admin-stat-card">
              <card.icon size={20} className="admin-stat-card-icon" />
              <div className="admin-stat-card-label">{card.label}</div>
              <div className="admin-stat-card-value">{card.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} style={{ color: '#a78bfa' }} />
            最近作品
          </h3>
          <Link to="/admin/works" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            查看全部 <ArrowRight size={12} />
          </Link>
        </div>
        {recentWorks.length === 0 ? (
          <div className="admin-empty">暂无作品</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>发布时间</th>
                  <th>点赞</th>
                </tr>
              </thead>
              <tbody>
                {recentWorks.map((work) => (
                  <tr key={work.id}>
                    <td style={{ fontWeight: 500 }}>{work.title}</td>
                    <td>{new Date(work.created_at).toLocaleDateString('zh-CN')}</td>
                    <td>{work.likes_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
