import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Wrench } from 'lucide-react'
import { sbQuery } from '../lib/supabase'
import GridBackground from '../components/Background/GridBackground'
import './DetailPage.css'

export default function SkillDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    sbQuery('skills_data', { params: '?select=*&id=eq.' + id })
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
            <p>未找到该技能</p>
            <Link to="/skills" className="detail-back" style={{ justifyContent: 'center', marginTop: 16 }}>
              <ArrowLeft size={16} />
              返回技能列表
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
        <Link to="/skills" className="detail-back">
          <ArrowLeft size={16} />
          返回技能列表
        </Link>

        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-icon">
            {item.icon_url ? (
              <img src={item.icon_url} alt={item.name} />
            ) : (
              <Wrench size={28} />
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

        {/* External link */}
        {item.url && (
          <div className="detail-section">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link-btn"
            >
              <ExternalLink size={16} />
              访问技能详情
            </a>
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
