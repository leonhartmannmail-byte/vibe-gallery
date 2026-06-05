import { useState, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
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

function AdminHomeConfig() {
  const { fetchTable, updateRow } = useAdmin()
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)

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
                <th>模块</th>
                <th>标识</th>
                <th>显示</th>
                <th>排序</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config, idx) => (
                <tr key={config.id}>
                  <td style={{ fontWeight: 500 }}>
                    <span style={{ marginRight: 8 }}>{MODULE_ICONS[config.module_key] || '\u{1F4E6}'}</span>
                    {config.module_name}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminHomeConfig
