import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Star, ExternalLink } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

function AdminWorks() {
  const { fetchTable, updateRow, deleteRow } = useAdmin()
  const [works, setWorks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchTable('works', 'select=*&order=created_at.desc')
      setWorks(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    if (!confirm('确定要删除这个作品吗？此操作不可撤销。')) return
    try {
      await deleteRow('works', id)
      setWorks(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  async function toggleFeatured(work) {
    try {
      await updateRow('works', work.id, { is_featured: !work.is_featured })
      setWorks(prev => prev.map(w => w.id === work.id ? { ...w, is_featured: !w.is_featured } : w))
    } catch (err) {
      alert('更新失败: ' + err.message)
    }
  }

  const filtered = works.filter(w =>
    w.title?.toLowerCase().includes(search.toLowerCase()) ||
    w.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">作品管理</h1>
          <p className="admin-page-subtitle">管理所有用户发布的作品，共 {works.length} 个</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="搜索作品标题或描述..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>平台</th>
              <th>点赞</th>
              <th>推荐</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="admin-empty">没有找到作品</td></tr>
            ) : filtered.map(work => (
              <tr key={work.id}>
                <td style={{ fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {work.title}
                </td>
                <td>{work.platform || '-'}</td>
                <td>{work.likes_count || 0}</td>
                <td>
                  <button
                    className={`admin-toggle ${work.is_featured ? 'admin-toggle--active' : ''}`}
                    onClick={() => toggleFeatured(work)}
                    title={work.is_featured ? '取消推荐' : '设为推荐'}
                  >
                    <div className="admin-toggle-knob" />
                  </button>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(work.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  <div className="admin-actions-cell">
                    <a href={`/work/${work.id}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm" title="查看">
                      <ExternalLink size={12} />
                    </a>
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(work.id)} title="删除">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminWorks
