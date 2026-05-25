import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

function Debug() {
  const { user, profile, loading } = useAuth()
  const { t } = useLanguage()
  const [tests, setTests] = useState([])
  const [running, setRunning] = useState(false)

  function addTest(name, status, detail = '') {
    setTests(prev => [...prev, { name, status, detail }])
  }

  async function withTimeout(promise, ms = 10000) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`超时 (${ms / 1000}s)`)), ms)
    )
    return Promise.race([promise, timeout])
  }

  async function runTests() {
    setTests([])
    setRunning(true)

    // 测试 1: 环境变量
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    addTest('环境变量', url && key ? 'pass' : 'fail',
      `URL: ${url || '缺失'}, Key: ${key ? key.substring(0, 20) + '...' : '缺失'}`)

    // 测试 2: HTTP 可达性（用 profiles 表测试，因为根路径会返回 401 是正常的）
    try {
      const res = await withTimeout(fetch(url + '/rest/v1/profiles?select=id&limit=1', {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      }))
      addTest('Supabase 连接', res.ok ? 'pass' : 'fail', `状态码: ${res.status}`)
    } catch (err) {
      addTest('Supabase 连接', 'fail', err.message)
    }

    // 测试 3: 认证状态
    try {
      const { data: { session }, error } = await withTimeout(supabase.auth.getSession())
      if (error) throw error
      addTest('认证状态', session ? 'pass' : 'warn',
        session ? `已登录: ${session.user.email}` : '未登录')
    } catch (err) {
      addTest('认证状态', 'fail', err.message)
    }

    // 测试 4: 查询 profiles 表
    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('id, username').limit(3)
      )
      if (error) throw error
      addTest('profiles 表', 'pass', `共 ${data?.length || 0} 条: ${JSON.stringify(data)}`)
    } catch (err) {
      addTest('profiles 表', 'fail', err.message)
    }

    // 测试 5: 查询 works 表
    try {
      const { data, error } = await withTimeout(
        supabase.from('works').select('id, title').limit(3)
      )
      if (error) throw error
      addTest('works 表', 'pass', `共 ${data?.length || 0} 条: ${JSON.stringify(data)}`)
    } catch (err) {
      addTest('works 表', 'fail', err.message)
    }

    // 测试 6: Storage
    try {
      const { data, error } = await withTimeout(
        supabase.storage.from('works').list('', { limit: 1 })
      )
      if (error) throw error
      addTest('Storage', 'pass', error?.message || `成功，${data?.length || 0} 个文件`)
    } catch (err) {
      addTest('Storage', 'fail', err.message)
    }

    // 测试 7: 直接 fetch 查单条记录（绕过客户端）
    try {
      const res = await withTimeout(
        fetch(`${url}/rest/v1/works?select=id,title&limit=1`, {
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        })
      )
      const data = await res.json()
      addTest('直接fetch查询', 'pass', `状态码: ${res.status}, 数据: ${JSON.stringify(data).substring(0, 200)}`)
    } catch (err) {
      addTest('直接fetch查询', 'fail', err.message)
    }

    // 测试 8: 用客户端查单条（模拟 fetchWork）
    try {
      const { data, error } = await withTimeout(
        supabase.from('works').select('id, title').limit(1)
      )
      if (error) throw error
      addTest('客户端limit查询', 'pass', `共 ${data?.length || 0} 条: ${JSON.stringify(data)}`)
    } catch (err) {
      addTest('客户端limit查询', 'fail', err.message)
    }

    // 测试 9: 用 .eq() 查单条（正是 fetchWork 的方式）
    try {
      const { data: allWorks } = await supabase.from('works').select('id').limit(1)
      const testId = allWorks?.[0]?.id
      if (!testId) {
        addTest('.eq查询', 'warn', '没有作品可测试')
      } else {
        const { data, error } = await withTimeout(
          supabase.from('works').select('id, title').eq('id', testId)
        )
        if (error) throw error
        addTest('.eq查询', 'pass', `查询id=${testId}, 结果: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      addTest('.eq查询', 'fail', err.message)
    }

    setRunning(false)
  }

  useEffect(() => { runTests() }, [])

  const colors = { pass: 'var(--success-color)', fail: 'var(--accent-like)', warn: '#fbbf24' }
  const labels = { pass: t('debug.pass'), fail: t('debug.fail'), warn: t('debug.warn') }

  return (
    <div style={{ padding: '100px 24px 40px', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}><span className="gradient-text">{t('debug.title')}</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        {t('debug.subtitle')}
      </p>

      <div style={{ marginBottom: 16 }}>
        <button onClick={runTests} disabled={running} style={{
          padding: '8px 20px', background: 'var(--gradient-primary)',
          color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600
        }}>
          {running ? t('debug.retesting') : t('debug.retest')}
        </button>
        <Link to="/" style={{ marginLeft: 12, fontSize: 14, color: 'var(--text-muted)' }}>{t('debug.backToHome')}</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tests.map((test, i) => (
          <div key={i} style={{
            padding: 16, background: 'var(--bg-secondary)',
            border: `1px solid ${test.status === 'fail' ? 'rgba(244,63,94,0.3)' : 'var(--border-color)'}`,
            borderRadius: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{test.name}</span>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: `${colors[test.status]}20`, color: colors[test.status]
              }}>{labels[test.status]}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {test.detail}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('debug.currentUser')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          <div>loading: {String(loading)}</div>
          <div>user: {user ? user.email : 'null'}</div>
          <div>profile: {profile ? profile.username : 'null'}</div>
        </div>
      </div>
    </div>
  )
}

export default Debug
