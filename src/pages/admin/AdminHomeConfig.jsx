import { useState, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown, RotateCcw, Pencil, Check, X, Globe } from 'lucide-react'
import useAdmin from '../../hooks/useAdmin'

const MODULE_ICONS = {
  featured: '\u{2B50}',
  trending: '\u{1F525}',
  creators: '\u{1F3C6}',
  nav_sites: '\u{1F9ED}',
  ai_prompts: '\u{1F4AC}',
  mcp_servers: '\u{1F50C}',
  skills: '\u{1F6E0}',
}

// 各模块的默认中文名称
export const DEFAULT_MODULE_NAMES = {
  featured: '精选作品',
  trending: '本周热门作品',
  creators: '创作者榜单',
  nav_sites: '导航网站推荐',
  ai_prompts: 'AI 提示词',
  mcp_servers: 'MCP 服务',
  skills: 'Skills 技能',
}

// 各模块的默认英文名称
export const DEFAULT_MODULE_NAMES_EN = {
  featured: 'Featured Works',
  trending: 'Trending This Week',
  creators: 'Top Creators',
  nav_sites: 'Recommended Sites',
  ai_prompts: 'AI Prompts',
  mcp_servers: 'MCP Servers',
  skills: 'Skills',
}

function AdminHomeConfig() {
  const { fetchTable, updateRow } = useAdmin()
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  // 正在编辑名称的行 ID 和临时值（双语）
  const [editingId, setEditingId] = useState(null)
  const [editZh, setEditZh] = useState('')
  const [editEn, setEditEn] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await fetchTable('home_config', 'select=*&order=sort_order.asc')
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
      await updateRow('home_config', config.id, { is_visible: !config.is_visible })
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
        updateRow('home_config', item.id, { sort_order: other.sort_order }),
        updateRow('home_config', other.id, { sort_order: item.sort_order }),
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

  // 开始编辑名称（双语）
  function startEdit(config) {
    setEditingId(config.id)
    setEditZh(config.module_name || '')
    setEditEn(config.config?.name_en || '')
  }

  // 取消编辑
  function cancelEdit() {
    setEditingId(null)
    setEditZh('')
    setEditEn('')
  }

  // 保存名称（双语）
  async function saveName(config) {
    const zh = editZh.trim()
    const en = editEn.trim()
    if (!zh) { cancelEdit(); return }
    const newConfig = { ...(config.config || {}), name_en: en || null }
    try {
      await updateRow('home_config', config.id, { module_name: zh, config: newConfig })
      setConfigs(prev => prev.map(c => c.id === config.id
        ? { ...c, module_name: zh, config: newConfig }
        : c
      ))
      cancelEdit()
    } catch (err) {
      alert('更新名称失败: ' + err.message)
    }
  }

  // 恢复默认名称（双语）
  async function resetName(config) {
    const defaultZh = DEFAULT_MODULE_NAMES[config.module_key] || ''
    const newConfig = { ...(config.config || {}), name_en: null }
    try {
      await updateRow('home_config', config.id, { module_name: defaultZh, config: newConfig })
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
          <h1 className="admin-page-title">首页配置</h1>
          <p className="admin-page-subtitle">控制首页各模块的显示与排序</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 280 }}>模块名称</th>
                <th>标识</th>
                <th>显示</th>
                <th>排序</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config, idx) => {
                const defaultZh = DEFAULT_MODULE_NAMES[config.module_key] || ''
                const defaultEn = DEFAULT_MODULE_NAMES_EN[config.module_key] || ''
                const currentEn = config.config?.name_en || ''
                const isCustom = config.module_name !== defaultZh || (currentEn && currentEn !== defaultEn)
                const isEditing = editingId === config.id
                return (
                  <tr key={config.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ flexShrink: 0, paddingTop: 6 }}>{MODULE_ICONS[config.module_key] || '\u{1F4E6}'}</span>
                        {isEditing ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* 中文名称输入 */}
                            <div className="admin-i18n-row">
                              <span className="admin-i18n-label">中文</span>
                              <input
                                className="admin-input"
                                value={editZh}
                                onChange={e => setEditZh(e.target.value)}
                                autoFocus
                                style={{ flex: 1, minWidth: 0 }}
                                maxLength={30}
                                placeholder={defaultZh}
                              />
                            </div>
                            {/* 英文名称输入 */}
                            <div className="admin-i18n-row">
                              <span className="admin-i18n-label">EN</span>
                              <input
                                className="admin-input"
                                value={editEn}
                                onChange={e => setEditEn(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveName(config); if (e.key === 'Escape') cancelEdit() }}
                                style={{ flex: 1, minWidth: 0 }}
                                maxLength={50}
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
                              <span style={{ fontWeight: 500, cursor: 'pointer', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => startEdit(config)} title="点击编辑">
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
                            {/* 英文名称预览 */}
                            <div style={{ fontSize: 11, color: '#71717a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Globe size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                              {currentEn || <span style={{ fontStyle: 'italic' }}>{defaultEn}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, color: '#a78bfa', background: '#27272a', padding: '2px 6px', borderRadius: 4 }}>{config.module_key}</code></td>
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

export default AdminHomeConfig
