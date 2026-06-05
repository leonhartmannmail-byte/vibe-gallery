import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { sbQuery } from '../lib/supabase'
import GridBackground from '../components/Background/GridBackground'
import './DetailPage.css'

export default function PromptDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    sbQuery('ai_prompts', { params: '?select=*&id=eq.' + id })
      .then(data => {
        if (cancelled) return
        const record = Array.isArray(data) ? data[0] : data
        setItem(record || null)
      })
      .catch(() => {
        if (!cancelled) setItem(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  async function handleCopy() {
    if (!item?.content) return
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = item.content
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <GridBackground />
        <div className="detail-loading">
          <div className="skeleton detail-skeleton-icon" />
          <div className="skeleton detail-skeleton-title" />
          <div className="skeleton detail-skeleton-meta" />
          <div className="skeleton detail-skeleton-text" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="detail-page">
        <GridBackground />
        <div className="detail-container">
          <div className="detail-not-found">
            <p>未找到该提示词</p>
            <Link to="/prompts" className="detail-back" style={{ justifyContent: 'center', marginTop: 16 }}>
              <ArrowLeft size={16} />
              返回提示词列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const createdDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <div className="detail-page">
      <GridBackground />
      <motion.div
        className="detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link to="/prompts" className="detail-back">
          <ArrowLeft size={16} />
          返回提示词列表
        </Link>

        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-icon">
            {item.icon_url ? (
              <img src={item.icon_url} alt={item.name} />
            ) : (
              <span>{item.name?.[0] || '?'}</span>
            )}
          </div>
          <div className="detail-hero-info">
            <h1 className="detail-title">{item.name}</h1>
            <div className="detail-meta">
              {item.category && (
                <span className="detail-category">{item.category}</span>
              )}
              {item.is_recommended && (
                <span className="detail-recommended">推荐</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="detail-section">
            <div className="detail-section-label">描述</div>
            <div className="detail-description">{item.description}</div>
          </div>
        )}

        {/* Content / Prompt */}
        {item.content && (
          <div className="detail-section">
            <div className="detail-section-label">Prompt 内容</div>
            <div className="detail-content-wrapper">
              <pre className="detail-content">{item.content}</pre>
              <button
                className={`detail-copy-btn ${copied ? 'detail-copy-btn--copied' : ''}`}
                onClick={handleCopy}
                title={copied ? '已复制' : '复制内容'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {(createdDate || item.sort_order != null) && (
          <div className="detail-footer">
            {createdDate && (
              <span className="detail-footer-item">创建于 {createdDate}</span>
            )}
            {item.sort_order != null && (
              <span className="detail-footer-item">排序 {item.sort_order}</span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
