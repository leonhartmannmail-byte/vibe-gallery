import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Tag, ChevronLeft, ChevronRight, Edit3, Trash2, Wrench, Bot, Terminal, Clock, Layers, Smartphone, Monitor, X, ZoomIn, Calendar, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { useScrollToTopOnRouteChange } from '../hooks/useScrollRestoration'
import { getWorkMetadata } from '../utils/workMetadata'
import { getToolConfig, getModelConfig } from '../config/enums'
import { getToolIcon, getModelIcon } from '../utils/lobeIcons'
import LikeButton from '../components/LikeButton/LikeButton'
import CommentSection from '../components/CommentSection/CommentSection'
import WorkCard from '../components/WorkCard/WorkCard'
import MasonryGrid from '../components/MasonryGrid/MasonryGrid'
import './WorkDetail.css'

function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchWork, deleteWork, fetchRelatedWorks } = useWorks()
  const { t, locale } = useLanguage()

  useScrollToTopOnRouteChange()
  const [work, setWork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [metadata, setMetadata] = useState(null)
  const [relatedWorks, setRelatedWorks] = useState({ similar: [], fromAuthor: [] })

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await fetchWork(id)
      if (cancelled) return
      setWork(data)
      setMetadata(getWorkMetadata(id))
      setLoading(false)
      if (data) {
        const related = await fetchRelatedWorks({
          tags: data.tags || [],
          authorId: data.user_id,
          excludeId: data.id,
        })
        if (!cancelled) setRelatedWorks(related)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, fetchWork, fetchRelatedWorks])

  const isEmojiCover = !!(work && work.cover_bg && work.cover_emoji)

  const allImages = work ? (
    work.cover_bg && work.cover_emoji
      ? ['emoji-cover', ...(work.images || [])]
      : work.cover_url && work.cover_url !== 'emoji-cover'
        ? [work.cover_url, ...(work.images || []).filter(url => url !== work.cover_url)]
        : work.images || []
  ) : []
  const imageCount = allImages.filter(img => img !== 'emoji-cover').length

  useEffect(() => {
    if (!showPreview) return
    function handleKey(e) {
      if (e.key === 'Escape') setShowPreview(false)
      if (e.key === 'ArrowLeft') setCurrentImage(prev => prev === 0 ? allImages.length - 1 : prev - 1)
      if (e.key === 'ArrowRight') setCurrentImage(prev => prev === allImages.length - 1 ? 0 : prev + 1)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [showPreview, allImages.length])

  function handlePrevImage() {
    setCurrentImage(prev => prev === 0 ? allImages.length - 1 : prev - 1)
  }
  function handleNextImage() {
    setCurrentImage(prev => prev === allImages.length - 1 ? 0 : prev + 1)
  }
  function openPreview() {
    if (imageCount > 0 && allImages[currentImage] !== 'emoji-cover') {
      setShowPreview(true)
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="wd-page">
        <div className="wd-container">
          <div className="wd-skeleton">
            <div className="wd-skeleton-gallery">
              <div className="skeleton wd-skel-image" />
              <div className="wd-skel-thumbs">
                <div className="skeleton wd-skel-thumb" />
                <div className="skeleton wd-skel-thumb" />
                <div className="skeleton wd-skel-thumb" />
              </div>
            </div>
            <div className="wd-skeleton-info">
              <div className="skeleton" style={{ height: 32, width: '70%' }} />
              <div className="skeleton" style={{ height: 20, width: '40%' }} />
              <div className="skeleton" style={{ height: 120, width: '100%' }} />
              <div className="skeleton" style={{ height: 80, width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---- Not Found ---- */
  if (!work) {
    return (
      <div className="wd-page">
        <div className="wd-container">
          <div className="wd-not-found">
            <p>{t('workDetail.notFound')}</p>
            <Link to="/" className="wd-back-link">{t('workDetail.backToHome')}</Link>
          </div>
        </div>
      </div>
    )
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await deleteWork(work.id)
    if (error) {
      setDeleting(false)
      setShowDeleteConfirm(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="wd-page">
      <div className="wd-container">

        {/* 顶部返回 */}
        <button className="wd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>{t('workDetail.backToHome') || '返回'}</span>
        </button>

        {/* ====== 两栏主体 ====== */}
        <div className="wd-main">

          {/* ---- 左栏：画廊 ---- */}
          <div className="wd-gallery">
            <div className="wd-gallery-sticky">
              <div className="wd-hero" onClick={openPreview} style={{ cursor: imageCount > 0 ? 'zoom-in' : 'default' }}>
                <AnimatePresence mode="wait">
                  {isEmojiCover && currentImage === 0 ? (
                    <motion.div
                      key="emoji"
                      className="wd-emoji-cover"
                      style={{ background: work.cover_bg }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="wd-emoji">{work.cover_emoji}</span>
                    </motion.div>
                  ) : allImages.length > 0 ? (
                    <motion.img
                      key={currentImage}
                      src={allImages[currentImage]}
                      alt={work.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const ph = document.createElement('div')
                        ph.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--text-muted);font-size:14px;'
                        ph.textContent = 'Image not available'
                        e.target.parentElement.appendChild(ph)
                      }}
                    />
                  ) : (
                    <div className="wd-no-image"><Monitor size={32} /></div>
                  )}
                </AnimatePresence>

                {imageCount > 0 && allImages[currentImage] !== 'emoji-cover' && (
                  <div className="wd-zoom-hint"><ZoomIn size={18} /></div>
                )}

                {allImages.length > 1 && (
                  <>
                    <button className="wd-nav-btn wd-nav-btn--prev" onClick={e => { e.stopPropagation(); handlePrevImage() }}>
                      <ChevronLeft size={22} />
                    </button>
                    <button className="wd-nav-btn wd-nav-btn--next" onClick={e => { e.stopPropagation(); handleNextImage() }}>
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* 缩略图 */}
              {allImages.length > 1 && (
                <div className="wd-thumbs">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      className={`wd-thumb ${i === currentImage ? 'wd-thumb--active' : ''}`}
                      onClick={() => setCurrentImage(i)}
                    >
                      {url === 'emoji-cover' ? (
                        <div className="wd-thumb-emoji" style={{ background: work.cover_bg }}>{work.cover_emoji}</div>
                      ) : (
                        <img src={url} alt="" onError={e => { e.target.style.display = 'none' }} />
                      )}
                    </button>
                  ))}
                  <span className="wd-thumb-count">{currentImage + 1}/{allImages.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* ---- 右栏：信息 ---- */}
          <div className="wd-info">

            {/* 标题 */}
            <h1 className="wd-title">{work.title}</h1>

            {/* 作者 */}
            <Link to={`/profile/${work.user_id}`} className="wd-author">
              <div className="wd-author-avatar">
                {work.profiles?.avatar_url ? (
                  <img src={work.profiles.avatar_url} alt="" />
                ) : (
                  <span>{(work.profiles?.username || '?')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="wd-author-body">
                <div className="wd-author-name">{work.profiles?.username || t('common.anonymous')}</div>
                {work.profiles?.bio && <div className="wd-author-bio">{work.profiles.bio}</div>}
              </div>
            </Link>

            {/* 操作行 */}
            <div className="wd-actions">
              <LikeButton workId={work.id} initialCount={work.likes_count} size="large" />
              {work.link && (
                <a href={work.link} target="_blank" rel="noopener noreferrer" className="wd-visit-btn">
                  <ExternalLink size={15} />
                  <span>{t('workDetail.visitLink')}</span>
                </a>
              )}
              {work.platform && (
                <span className="wd-platform">
                  {work.platform === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                  {t(`platform.${work.platform}`)}
                </span>
              )}
            </div>

            {/* 作者专属操作 */}
            {user?.id === work.user_id && (
              <div className="wd-owner">
                <button className="wd-owner-btn wd-owner-btn--edit" onClick={() => navigate(`/edit/${work.id}`)}>
                  <Edit3 size={14} /> {t('workDetail.edit')}
                </button>
                <button className="wd-owner-btn wd-owner-btn--delete" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> {t('workDetail.delete')}
                </button>
              </div>
            )}

            {/* ---- 描述（重点） ---- */}
            {work.description && (
              <section className="wd-block wd-block--desc">
                <h3 className="wd-block-title">{t('workDetail.description')}</h3>
                <p className="wd-desc-text">{work.description}</p>
              </section>
            )}

            {/* ---- 标签 ---- */}
            {work.tags && work.tags.length > 0 && (
              <div className="wd-tags">
                {work.tags.map(tag => (
                  <Link key={tag} to={`/tag/${tag}`} className="wd-tag-chip">#{tag}</Link>
                ))}
              </div>
            )}

            {/* ---- AI 开发工具 ---- */}
            {work.ai_tools && work.ai_tools.length > 0 && (
              <section className="wd-block">
                <h3 className="wd-block-title wd-block-title--sub">
                  <Wrench size={14} />
                  {t('publish.aiTools')}
                </h3>
                <div className="wd-badge-row">
                  {work.ai_tools.map(tool => {
                    const cfg = getToolConfig(tool)
                    const Icon = getToolIcon(tool)
                    return (
                      <span key={tool} className="wd-badge" style={{ color: cfg.color, borderColor: `${cfg.color}30` }}>
                        {Icon && <Icon size={11} />}
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ---- 底层模型 ---- */}
            {work.ai_models && work.ai_models.length > 0 && (
              <section className="wd-block">
                <h3 className="wd-block-title wd-block-title--sub">
                  <Bot size={14} />
                  {t('publish.aiModels')}
                </h3>
                <div className="wd-badge-row">
                  {work.ai_models.map(model => {
                    const cfg = getModelConfig(model)
                    const Icon = getModelIcon(model)
                    return (
                      <span key={model} className="wd-badge" style={{ color: cfg.color, borderColor: `${cfg.color}30` }}>
                        {Icon && <Icon size={11} />}
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ---- 扩展元信息 ---- */}
            {(metadata?.devTime || metadata?.techStack?.length > 0 || metadata?.tools?.length > 0 || metadata?.aiWorkflow || metadata?.prompt) && (
              <section className="wd-block wd-block--meta">
                {(metadata?.devTime || metadata?.techStack?.length > 0) && (
                  <div className="wd-meta-card">
                    {metadata?.devTime && (
                      <div className="wd-meta-line">
                        <Clock size={13} />
                        <span className="wd-meta-k">{t('workDetail.devTime')}</span>
                        <span className="wd-meta-v">{metadata.devTime}</span>
                      </div>
                    )}
                    {metadata?.techStack?.length > 0 && (
                      <div className="wd-meta-line">
                        <Layers size={13} />
                        <span className="wd-meta-k">Tech Stack</span>
                        <div className="wd-meta-tags">
                          {metadata.techStack.map(tech => (
                            <span key={tech} className="wd-meta-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {metadata?.tools?.length > 0 && (
                  <div className="wd-meta-card">
                    <div className="wd-meta-line">
                      <Wrench size={13} />
                      <span className="wd-meta-k">{t('workDetail.toolsUsed')}</span>
                    </div>
                    <div className="wd-badge-row" style={{ marginTop: 6 }}>
                      {metadata.tools.map(tool => (
                        <span key={tool} className="wd-badge wd-badge--plain">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}

                {metadata?.aiWorkflow && (
                  <div className="wd-meta-card">
                    <div className="wd-meta-line">
                      <Bot size={13} />
                      <span className="wd-meta-k">{t('workDetail.aiWorkflow')}</span>
                    </div>
                    <p className="wd-meta-paragraph">{metadata.aiWorkflow}</p>
                  </div>
                )}

                {metadata?.prompt && (
                  <div className="wd-meta-card">
                    <div className="wd-meta-line">
                      <Terminal size={13} />
                      <span className="wd-meta-k">{t('workDetail.prompt')}</span>
                    </div>
                    <pre className="wd-prompt">{metadata.prompt}</pre>
                  </div>
                )}
              </section>
            )}

            {/* ---- 发布时间 ---- */}
            <div className="wd-published">
              <Calendar size={13} />
              {t('workDetail.publishedAt', {
                date: new Date(work.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })
              })}
            </div>

          </div>
        </div>

        {/* ====== 底部全宽 ====== */}
        <div className="wd-bottom">
          {relatedWorks.similar.length > 0 && (
            <section className="wd-related">
              <h3 className="wd-related-title">{t('workDetail.similarWorks')}</h3>
              <MasonryGrid>
                {relatedWorks.similar.map((w, i) => (
                  <div key={w.id} className="wd-related-item"><WorkCard work={w} index={i} /></div>
                ))}
              </MasonryGrid>
            </section>
          )}

          {relatedWorks.fromAuthor.length > 0 && (
            <section className="wd-related">
              <h3 className="wd-related-title">{t('workDetail.moreFromAuthor')}</h3>
              <MasonryGrid>
                {relatedWorks.fromAuthor.map((w, i) => (
                  <div key={w.id} className="wd-related-item"><WorkCard work={w} index={i} /></div>
                ))}
              </MasonryGrid>
            </section>
          )}

          <CommentSection workId={work.id} />
        </div>
      </div>

      {/* ===== 删除弹窗 ===== */}
      {showDeleteConfirm && (
        <div className="wd-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div
            className="wd-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>{t('workDetail.deleteTitle')}</h3>
            <p>{t('workDetail.deleteConfirm')}</p>
            <div className="wd-modal-btns">
              <button className="wd-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>
                {t('common.cancel')}
              </button>
              <button className="wd-modal-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? t('workDetail.deleting') : t('workDetail.confirmDelete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== 图片预览 ===== */}
      <AnimatePresence>
        {showPreview && allImages[currentImage] && allImages[currentImage] !== 'emoji-cover' && (
          <motion.div
            className="wd-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <button className="wd-preview-close" onClick={() => setShowPreview(false)}><X size={24} /></button>
            <motion.img
              className="wd-preview-img"
              src={allImages[currentImage]}
              alt={work.title}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            />
            {imageCount > 1 && (
              <>
                <button className="wd-preview-nav wd-preview-nav--prev" onClick={e => { e.stopPropagation(); handlePrevImage() }}>
                  <ChevronLeft size={32} />
                </button>
                <button className="wd-preview-nav wd-preview-nav--next" onClick={e => { e.stopPropagation(); handleNextImage() }}>
                  <ChevronRight size={32} />
                </button>
                <div className="wd-preview-counter">{currentImage + 1} / {allImages.length}</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkDetail
