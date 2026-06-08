import { useState, useEffect, useCallback } from 'react'
import useAdmin from '../../hooks/useAdmin'

const CONFIG_ITEMS = [
  {
    key: 'oauth_google_enabled',
    name: 'Google 账号登录',
    desc: '允许用户通过 Google 账号一键登录，需在 Supabase 后台配置 Google OAuth 凭据',
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
  },
  {
    key: 'oauth_github_enabled',
    name: 'GitHub 账号登录',
    desc: '允许用户通过 GitHub 账号一键登录，需在 Supabase 后台配置 GitHub OAuth 凭据',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
]

function AdminSiteConfig() {
  const { fetchTable, updateRow } = useAdmin()
  const [configs, setConfigs] = useState({})
  const [configRows, setConfigRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await fetchTable('site_config', 'select=*')
      const map = {}
      ;(data || []).forEach(row => {
        map[row.config_key] = row
      })
      setConfigs(map)
      setConfigRows(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchTable])

  useEffect(() => { load() }, [load])

  async function toggleConfig(item) {
    const row = configs[item.key]
    if (!row) return
    const newVal = !row.config_value
    setSaving(item.key)
    try {
      await updateRow('site_config', row.id, {
        config_value: newVal,
        updated_at: new Date().toISOString(),
      })
      setConfigs(prev => ({
        ...prev,
        [item.key]: { ...prev[item.key], config_value: newVal }
      }))
    } catch (err) {
      alert('更新失败: ' + err.message)
    } finally {
      setSaving('')
    }
  }

  if (loading) return <div className="admin-empty">加载中...</div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">登录配置</h1>
          <p className="admin-page-subtitle">管理第三方账号登录方式，开启前请确保已在 Supabase 后台配置对应的 OAuth 凭据</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}></th>
                <th>登录方式</th>
                <th>说明</th>
                <th style={{ width: 80 }}>状态</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG_ITEMS.map(item => {
                const row = configs[item.key]
                const enabled = row?.config_value === true
                return (
                  <tr key={item.key}>
                    <td style={{ color: enabled ? '#e4e4e7' : '#52525b' }}>
                      {item.icon}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#e4e4e7' }}>{item.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>
                        {item.desc}
                      </div>
                      <code style={{ fontSize: 11, color: '#71717a', marginTop: 4, display: 'inline-block' }}>
                        {item.key}
                      </code>
                    </td>
                    <td>
                      <button
                        className={`admin-toggle ${enabled ? 'admin-toggle--active' : ''}`}
                        onClick={() => toggleConfig(item)}
                        disabled={saving === item.key}
                        title={enabled ? '点击关闭' : '点击开启'}
                      >
                        <div className="admin-toggle-knob" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 12 }}>
          配置说明
        </h3>
        <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>
            <strong style={{ color: '#d4d4d8' }}>1.</strong> 开启前需要先在{' '}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener" style={{ color: '#a78bfa' }}>
              Supabase Dashboard
            </a>{' '}
            → Authentication → Providers 中配置对应平台的 OAuth Client ID 和 Secret。
          </p>
          <p style={{ marginBottom: 8 }}>
            <strong style={{ color: '#d4d4d8' }}>2.</strong> OAuth 回调地址统一为：
            <code style={{ fontSize: 12, color: '#a78bfa', background: '#27272a', padding: '2px 8px', borderRadius: 4, marginLeft: 4 }}>
              https://ialvldmslsltonmiqnyp.supabase.co/auth/v1/callback
            </code>
          </p>
          <p>
            <strong style={{ color: '#d4d4d8' }}>3.</strong> 关闭后，登录页面的 Google / GitHub 按钮将自动隐藏，用户仅能通过邮箱密码登录。
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminSiteConfig
