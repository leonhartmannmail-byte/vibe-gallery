import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, ExternalLink, User,
  Code2, Copy, Check, Package, Tag
} from 'lucide-react'
import { sbQuery } from '../lib/supabase'
import GridBackground from '../components/Background/GridBackground'
import './DetailPage.css'
import './SkillDetail.css'

function formatStars(n) {
  if (!n && n !== 0) return null
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function formatDate(ts) {
  if (!ts) return null
  const d = typeof ts === 'number'
    ? new Date(ts * 1000)
    : new Date(ts)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function extractRepoName(githubUrl) {
  if (!githubUrl) return null
  try {
    const m = githubUrl.match(/github\.com\/([^/]+\/[^/]+)/)
    return m ? m[1] : null
  } catch { return null }
}

export default function SkillDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [relatedSkills, setRelatedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    sbQuery('skills_data', { params: '?select=*&id=eq.' + id })
      .then(data => {
        if (cancelled) return
        const record = Array.isArray(data) ? data[0] : data
        setItem(record || null)

        // Fetch related skills from same author/repo
        if (record?.author_name) {
          sbQuery('skills_data', {
            params: `?select=id,name,description,stars_count,updated_at,slug&author_name=eq.${encodeURIComponent(record.author_name)}&id=neq.${record.id}&order=stars_count.desc&limit=6`
          }).then(related => {
            if (!cancelled) setRelatedSkills(Array.isArray(related) ? related : [])
          }).catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) setItem(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  const handleCopyInstall = () => {
    if (!item) return
    const repoName = extractRepoName(item.repo_url || item.githubUrl)
    if (!repoName) return
    navigator.clipboard.writeText(`npx skills add ${repoName}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="detail-page">
        <GridBackground />
        <div className="skill-detail-loading">
          <div className="skeleton" style={{ height: 20, width: '30%' }} />
          <div className="skeleton" style={{ height: 36, width: '50%', marginTop: 16 }} />
          <div className="skeleton" style={{ height: 20, width: '70%', marginTop: 12 }} />
          <div className="skill-detail-skeleton-layout">
            <div className="skeleton" style={{ height: 400, flex: 1 }} />
            <div className="skeleton" style={{ height: 300, width: 300 }} />
          </div>
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

  const repoName = item.repo_name || extractRepoName(item.repo_url || item.githubUrl)
  const starsDisplay = formatStars(item.stars_count)
  const updateDate = formatDate(item.updated_at || item.created_at)
  const installCmd = repoName ? `npx skills add ${repoName}` : null

  return (
    <div className="detail-page">
      <GridBackground />
      <motion.div
        className="skill-detail-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link to="/skills" className="detail-back">
          <ArrowLeft size={16} />
          返回技能列表
        </Link>

        {/* Breadcrumb */}
        <nav className="skill-breadcrumb">
          <Link to="/">首页</Link>
          <span>/</span>
          <Link to="/skills">Skills</Link>
          <span>/</span>
          <span className="skill-breadcrumb-current">{item.name}</span>
        </nav>

        {/* Hero header */}
        <header className="skill-detail-hero">
          <div className="skill-detail-hero-icon">
            {item.icon_url ? (
              <img src={item.icon_url} alt={item.name} />
            ) : (
              <span>{item.name?.[0]?.toUpperCase() || 'S'}</span>
            )}
          </div>
          <div className="skill-detail-hero-info">
            <h1 className="skill-detail-title">{item.name}</h1>
            <p className="skill-detail-desc">{item.description}</p>
            <div className="skill-detail-stats">
              {starsDisplay && (
                <span className="skill-stat">
                  <Star size={14} />
                  {starsDisplay} stars
                </span>
              )}
              {repoName && (
                <span className="skill-stat">
                  <Code2 size={14} />
                  {repoName}
                </span>
              )}
              {updateDate && (
                <span className="skill-stat">
                  <Clock size={14} />
                  {updateDate}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="skill-detail-layout">
          {/* Main content */}
          <main className="skill-detail-main">
            {/* Description / SKILL.md content */}
            {item.description && (
              <section className="skill-detail-section">
                <h2 className="skill-section-title">
                  <Tag size={16} />
                  Skill 说明
                </h2>
                <div className="skill-detail-content">
                  {item.description}
                </div>
              </section>
            )}

            {/* Category */}
            {item.category && (
              <section className="skill-detail-section">
                <h2 className="skill-section-title">
                  <Package size={16} />
                  分类
                </h2>
                <div className="skill-category-tags">
                  {item.category.split(',').map((cat, i) => (
                    <Link key={i} to={`/skills?category=${encodeURIComponent(cat.trim())}`} className="skill-category-tag">
                      {cat.trim()}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related skills from same author */}
            {relatedSkills.length > 0 && (
              <section className="skill-detail-section">
                <h2 className="skill-section-title">
                  <Package size={16} />
                  同作者更多 Skills
                </h2>
                <div className="skill-related-grid">
                  {relatedSkills.map(s => (
                    <Link key={s.id} to={`/skills/${s.id}`} className="skill-related-card">
                      <div className="skill-related-card-name">{s.name}</div>
                      <div className="skill-related-card-desc">{s.description}</div>
                      <div className="skill-related-card-meta">
                        {formatStars(s.stars_count) && (
                          <span><Star size={11} /> {formatStars(s.stars_count)}</span>
                        )}
                        {formatDate(s.updated_at) && (
                          <span>{formatDate(s.updated_at)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="skill-detail-sidebar">
            {/* Metadata card */}
            <div className="skill-sidebar-card">
              <h3 className="skill-sidebar-title">Skill 元数据</h3>
              <div className="skill-sidebar-list">
                {starsDisplay && (
                  <div className="skill-sidebar-item">
                    <Star size={14} className="skill-sidebar-icon skill-sidebar-icon--star" />
                    <span>星标</span>
                    <strong>{item.stars_count?.toLocaleString() || starsDisplay}</strong>
                  </div>
                )}
                {item.author_name && (
                  <div className="skill-sidebar-item">
                    <User size={14} className="skill-sidebar-icon skill-sidebar-icon--author" />
                    <span>作者</span>
                    <strong>{item.author_name}</strong>
                  </div>
                )}
                {updateDate && (
                  <div className="skill-sidebar-item">
                    <Clock size={14} className="skill-sidebar-icon skill-sidebar-icon--time" />
                    <span>更新时间</span>
                    <strong>{updateDate}</strong>
                  </div>
                )}
                {item.is_recommended && (
                  <div className="skill-sidebar-item">
                    <Check size={14} className="skill-sidebar-icon skill-sidebar-icon--check" />
                    <span>推荐</span>
                    <strong>是</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Source card */}
            {(repoName || item.repo_url || item.githubUrl) && (
              <div className="skill-sidebar-card">
                <h3 className="skill-sidebar-title">来源</h3>
                {item.author_name && (
                  <div className="skill-sidebar-author">
                    <Code2 size={16} />
                    <span>{item.author_name}</span>
                  </div>
                )}
                {repoName && (
                  <div className="skill-sidebar-repo">{repoName}</div>
                )}
                {(item.repo_url || item.githubUrl) && (
                  <a
                    href={item.repo_url || item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="skill-sidebar-link"
                  >
                    <ExternalLink size={14} />
                    打开 GitHub 仓库
                  </a>
                )}
              </div>
            )}

            {/* Install card */}
            {installCmd && (
              <div className="skill-sidebar-card">
                <h3 className="skill-sidebar-title">Install</h3>
                <div className="skill-install-box">
                  <code className="skill-install-cmd">{installCmd}</code>
                  <button
                    className={`skill-install-copy ${copied ? 'copied' : ''}`}
                    onClick={handleCopyInstall}
                    title={copied ? '已复制' : '复制命令'}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* External link */}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="skill-sidebar-external"
              >
                <ExternalLink size={14} />
                访问技能详情
              </a>
            )}
          </aside>
        </div>
      </motion.div>
    </div>
  )
}
