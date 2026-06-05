import { useState, useEffect, useCallback } from 'react'
import { Star, EyeOff } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

function AdminRecommendations() {
  const { fetchTable, updateRow } = useAdmin()
  const [featured, setFeatured] = useState([])
  const [allWorks, setAllWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)

  const load = useCallback(async () => {
    try {
      const all = await fetchTable('works', 'select=id,title,likes_count,is_featured,created_at&order=created_at.desc')
      setAllWorks(all || [])
      setFeatured((all || []).filter(w => w.is_featured))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable])

  useEffect(() => { load() }, [load])

  async function toggleFeature(work) {
    try {
      const newVal = !work.is_featured
      await updateRow('works', work.id, { is_featured: newVal })
      setAllWorks(prev => prev.map(w => w.id === work.id ? { ...w, is_featured: newVal } : w))
      setFeatured(prev => newVal
        ? [...prev, { ...work, is_featured: true }]
        : prev.filter(w => w.id !== work.id)
      )
    } catch (err) {
      alert('更新失败: ' + err.message)
    }
  }

  const nonFeatured = allWorks.filter(w => !w.is_featured)

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">作品推荐</h1>
          <p className="admin-page-subtitle">管理首页精选推荐作品，当前推荐 {featured.length} 个</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowPicker(!showPicker)}>
          <Star size={14} />
          {showPicker ? '关闭选择器' : '添加推荐'}
        </button>
      </div>

      {/* Current Featured */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 12 }}>
          当前推荐作品
        </h3>
        {featured.length === 0 ? (
          <div className="admin-empty">暂无推荐作品</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>点赞数</th>
                  <th>发布时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {featured.map(work => (
                  <tr key={work.id}>
                    <td style={{ fontWeight: 500 }}>{work.title}</td>
                    <td>{work.likes_count || 0}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(work.created_at).toLocaleDateString('zh-CN')}</td>
                    <td>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => toggleFeature(work)}>
                        <EyeOff size={12} /> 取消推荐
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Picker */}
      {showPicker && (
        <div className="admin-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 12 }}>
            选择作品加入推荐
          </h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>点赞数</th>
                  <th>发布时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {nonFeatured.length === 0 ? (
                  <tr><td colSpan={4} className="admin-empty">所有作品已推荐</td></tr>
                ) : nonFeatured.slice(0, 20).map(work => (
                  <tr key={work.id}>
                    <td style={{ fontWeight: 500 }}>{work.title}</td>
                    <td>{work.likes_count || 0}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(work.created_at).toLocaleDateString('zh-CN')}</td>
                    <td>
                      <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => toggleFeature(work)}>
                        <Star size={12} /> 推荐
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRecommendations
