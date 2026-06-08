import { useState, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown, RotateCcw, Pencil, Check, X, Globe, ExternalLink } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

const NAV_ICONS = {
  nav_sites: '🧭',
  ai_prompts: '💬',
  skills: '🛠',
  mcp_servers: '🔌',
}

// 默认中文名称
const DEFAULT_NAMES = {
  nav_sites: 'AI 导航',
  ai_prompts: 'AI 提示词',
  skills: 'Skills',
  mcp_servers: 'MCP',
}

// 默认英文名称
const DEFAULT_NAMES_EN = {
  nav_sites: 'AI Navigator',
  ai_prompts: 'AI Prompts',
  skills: 'Skills',
  mcp_servers: 'MCP',
}

function AdminNavConfig() {
  const { fetchTable, updateRow } = useAdmin()
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editZh, setEditZh] = useState('')
  const [editEn, setEditEn] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await fetchTable('navbar_config', 'select=*&order=sort_order.asc')
      setConfigs(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable])

  useEffect(() => { load() }, [load])

  async function toggleVisible(config) {
    try {
      await updateRow('navbar_config', config.id, { is_visible: !config.is_visible })
      setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, is_visible: !c.is_visible } : c))
    } catch (err) {
      alert('更新失败: ' + err.message)
    }
  }

  async function moveItem(item, direction) {
    const idx = configs.findIndex(c => c.id === item.id)
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= configs.length) return

    const other = configs[newIdx]
    try {
      await Promise.all([
        updateRow('navbar_config', item.id, { sort_order: other.sort_order }),
        updateRow('navbar_config', other.id, { sort_order: item.sort_order }),
      ])
      const newConfigs = [...configs]
      const temp = newConfigs[idx]
      newConfigs[idx] = newConfigs[newIdx]
      newConfigs[newIdx] = temp
      setConfigs(newConfigs)
    } catch (err) {
      alert('排序失败: ' + err.message)
    }
  }

  function startEdit(config) {
    setEditingId(config.id)
    setEditZh(config.module_name || '')
    setEditEn(config.config?.name_en || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditZh('')
    setEditEn('')
  }

  async function saveName(config) {
    const zh = editZh.trim()
    const en = editEn.trim()
    if (!zh) { cancelEdit(); return }
    const newConfig = { ...(config.config || {}), name_en: en || null }
    try {
      await updateRow('navbar_config', config.id, { module_name: zh, config: newConfig })
      setConfigs(prev => prev.map(c => c.id === config.id
        ? { ...c, module_name: zh, config: newConfig }
        : c
      ))
      cancelEdit()
    } catch (err) {
      alert('更新名称失败: ' + err.message)
    }
  }

  async function resetName(config) {
    const defaultZh = DEFAULT_NAMES[config.module_key] || ''
    const newConfig = { ...(config.config || {}), name_en: null }
    try {
      await updateRow('navbar_config', config.id, { module_name: defaultZh, config: newConfig })
      setConfigs(prev => prev.map(c => c.id === config.id
        ? { ...c, module_name: defaultZh, config: newConfig }
        : c
      ))
    } catch (err) {
      alert('恢复默认失败: ' + err.message)
    }
  }

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">导航栏配置</h1>
          <p className="admin-page-subtitle">配置顶部导航栏的快捷入口链接，支持自定义名称和多语言</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 280 }}>导航名称</th>
                <th>标识</th>
                <th>路由</th>
                <th>显示</th>
                <th>排序</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config, idx) => {
                const defaultZh = DEFAULT_NAMES[config.module_key] || ''
                const defaultEn = DEFAULT_NAMES_EN[config.module_key] || ''
                const currentEn = config.config?.name_en || ''
                const isCustom = config.module_name !== defaultZh || (currentEn && currentEn !== defaultEn)
                const isEditing = editingId === config.id
                return (
                  <tr key={config.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ flexShrink: 0, paddingTop: 6 }}>{NAV_ICONS[config.module_key] || '📦'}</span>
                        {isEditing ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="admin-i18n-row">
                              <span className="admin-i18n-label">中文</span>
                              <input
                                className="admin-input"
                                value={editZh}
                                onChange={e => setEditZh(e.target.value)}
                                autoFocus
                                style={{ flex: 1, minWidth: 0 }}
                                maxLength={20}
                                placeholder={defaultZh}
                              />
                            </div>
                            <div className="admin-i18n-row">
                              <span className="admin-i18n-label">EN</span>
                              <input
                                className="admin-input"
                                value={editEn}
                                onChange={e => setEditEn(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveName(config); if (e.key === 'Escape') cancelEdit() }}
                                style={{ flex: 1, minWidth: 0 }}
                                maxLength={40}
                                placeholder={defaultEn}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="admin-btn admin-btn--sm" onClick={() => saveName(config)} style={{ padding: '3px 10px' }} title="保存">
                                <Check size={12} /> <span style={{ fontSize: 12 }}>保存</span>
                              </button>
                              <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={cancelEdit} style={{ padding: '3px 10px' }} title="取消">
                                <X size={12} /> <span style={{ fontSize: 12 }}>取消</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 500, cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => startEdit(config)} title="点击编辑">
                                {config.module_name}
                              </span>
                              <button
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                                onClick={() => startEdit(config)}
                                style={{ padding: '3px 6px', flexShrink: 0 }}
                                title="编辑名称"
                              >
                                <Pencil size={11} />
                              </button>
                              {isCustom && (
                                <button
                                  className="admin-btn admin-btn--secondary admin-btn--sm"
                                  onClick={() => resetName(config)}
                                  style={{ padding: '3px 6px', flexShrink: 0, color: '#f59e0b' }}
                                  title={`恢复默认：${defaultZh} / ${defaultEn}`}
                                >
                                  <RotateCcw size={11} />
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                              <Globe size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                              {currentEn || <span style={{ fontStyle: 'italic' }}>{defaultEn}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, color: '#a78bfa', background: '#27272a', padding: '2px 6px', borderRadius: 4 }}>{config.module_key}</code></td>
                    <td>
                      <a
                        href={config.route_path}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}
                        title={`跳转: ${config.route_path}`}
                      >
                        {config.route_path}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td>
                      <button
                        className={`admin-toggle ${config.is_visible ? 'admin-toggle--active' : ''}`}
                        onClick={() => toggleVisible(config)}
                      >
                        <div className="admin-toggle-knob" />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => moveItem(config, 'up')}
                          disabled={idx === 0}
                          style={{ opacity: idx === 0 ? 0.3 : 1, padding: '3px 6px' }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => moveItem(config, 'down')}
                          disabled={idx === configs.length - 1}
                          style={{ opacity: idx === configs.length - 1 ? 0.3 : 1, padding: '3px 6px' }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminNavConfig
