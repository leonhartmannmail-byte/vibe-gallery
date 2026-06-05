import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Star } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

function AdminContentManager({ tableName, title, subtitle, fields }) {
  const { fetchTable, insertRow, updateRow, deleteRow } = useAdmin()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  const load = useCallback(async () => {
    try {
      const data = await fetchTable(tableName, 'select=*&order=sort_order.asc')
      setItems(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable, tableName])

  useEffect(() => { load() }, [load])

  function openCreate() {
    const defaults = {}
    fields.forEach(f => { defaults[f.key] = f.defaultValue || '' })
    setFormData(defaults)
    setEditingItem(null)
    setShowModal(true)
  }

  function openEdit(item) {
    setFormData({ ...item })
    setEditingItem(item)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  async function handleSave() {
    try {
      if (editingItem) {
        await updateRow(tableName, editingItem.id, formData)
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } : i))
      } else {
        await insertRow(tableName, formData)
        await load()
      }
      closeModal()
    } catch (err) {
      alert('保存失败: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除吗？')) return
    try {
      await deleteRow(tableName, id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  async function toggleActive(item) {
    try {
      await updateRow(tableName, item.id, { is_active: !item.is_active })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i))
    } catch (err) {
      alert('更新失败: ' + err.message)
    }
  }

  async function toggleRecommended(item) {
    try {
      await updateRow(tableName, item.id, { is_recommended: !item.is_recommended })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_recommended: !i.is_recommended } : i))
    } catch (err) {
      alert('更新推荐状态失败: ' + err.message)
    }
  }

  async function moveItem(item, direction) {
    const idx = items.findIndex(i => i.id === item.id)
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= items.length) return

    const other = items[newIdx]
    try {
      await Promise.all([
        updateRow(tableName, item.id, { sort_order: other.sort_order }),
        updateRow(tableName, other.id, { sort_order: item.sort_order }),
      ])
      const newItems = [...items]
      const temp = newItems[idx]
      newItems[idx] = newItems[newIdx]
      newItems[newIdx] = temp
      setItems(newItems)
    } catch (err) {
      alert('排序失败: ' + err.message)
    }
  }

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-subtitle">{subtitle}，共 {items.length} 个</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openCreate}>
          <Plus size={14} />
          新增
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder={`搜索${title}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>描述</th>
              <th>分类</th>
              <th>状态</th>
              <th>推荐</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="admin-empty">暂无数据</td></tr>
            ) : filtered.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </td>
                <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#a1a1aa' }}>
                  {item.description || '-'}
                </td>
                <td>{item.category || '-'}</td>
                <td>
                  <button
                    className={`admin-toggle ${item.is_active !== false ? 'admin-toggle--active' : ''}`}
                    onClick={() => toggleActive(item)}
                  >
                    <div className="admin-toggle-knob" />
                  </button>
                </td>
                <td>
                  <button
                    className={`admin-toggle admin-toggle--recommended ${item.is_recommended ? 'admin-toggle--active' : ''}`}
                    onClick={() => toggleRecommended(item)}
                    title={item.is_recommended ? '取消推荐' : '设为推荐'}
                  >
                    <div className="admin-toggle-knob">
                      <Star size={10} fill={item.is_recommended ? 'currentColor' : 'none'} />
                    </div>
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => moveItem(item, 'up')}
                      disabled={idx === 0}
                      style={{ opacity: idx === 0 ? 0.3 : 1, padding: '3px 6px' }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => moveItem(item, 'down')}
                      disabled={idx === filtered.length - 1}
                      style={{ opacity: idx === filtered.length - 1 ? 0.3 : 1, padding: '3px 6px' }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="admin-actions-cell">
                    <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(item)}>
                      <Pencil size={12} />
                    </button>
                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingItem ? '编辑' : '新增'}{title.slice(0, -1) || ''}</h3>
              <button className="admin-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              {fields.map(field => (
                <div key={field.key} className="admin-form-group">
                  <label className="admin-form-label">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="admin-form-textarea"
                      value={formData[field.key] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="admin-form-select"
                      value={formData[field.key] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    >
                      <option value="">请选择</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="admin-form-input"
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder || ''}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--secondary" onClick={closeModal}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContentManager
