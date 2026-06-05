import { useState, useEffect, useCallback } from 'react'
import { Search, Shield, User } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

function AdminAccounts() {
  const { fetchTable, updateRow } = useAdmin()
  const [profiles, setProfiles] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchTable('profiles', 'select=*&order=created_at.desc')
      setProfiles(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable])

  useEffect(() => { load() }, [load])

  async function toggleRole(profile) {
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    try {
      await updateRow('profiles', profile.id, { role: newRole })
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p))
    } catch (err) {
      alert('更新失败: ' + err.message)
    }
  }

  const filtered = profiles.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">账号管理</h1>
          <p className="admin-page-subtitle">管理注册用户，共 {profiles.length} 个</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="搜索用户名或邮箱..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>头像</th>
              <th>用户名</th>
              <th>角色</th>
              <th>作品数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="admin-empty">没有找到用户</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 600 }}>
                        {(p.username || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.username || '未设置'}</div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>{p.email || ''}</div>
                </td>
                <td>
                  <span className={`admin-status-badge ${p.role === 'admin' ? 'admin-status-badge--active' : 'admin-status-badge--inactive'}`}>
                    {p.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {p.role || 'user'}
                  </span>
                </td>
                <td>-</td>
                <td>
                  <button
                    className={`admin-btn admin-btn--sm ${p.role === 'admin' ? 'admin-btn--secondary' : 'admin-btn--primary'}`}
                    onClick={() => toggleRole(p)}
                  >
                    {p.role === 'admin' ? '取消管理员' : '设为管理员'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAccounts
