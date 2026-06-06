import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Tag, ChevronLeft, ChevronRight, Edit3, Trash2, Wrench, Bot, Terminal, Clock, Layers, Smartphone, Monitor, X, ZoomIn } from 'lucide-react'
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

  // 从其他详情页跳转过来时滚动到顶部
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

  // 图片列表（安全计算，work 可能为 null）
  const allImages = work ? (
    work.cover_bg && work.cover_emoji
      ? ['emoji-cover', ...(work.images || [])]
      : work.cover_url && work.cover_url !== 'emoji-cover'
        ? [work.cover_url, ...(work.images || []).filter(url => url !== work.cover_url)]
        : work.images || []
  ) : []
  const imageCount = allImages.filter(img => img !== 'emoji-cover').length

  // 预览模态框键盘事件（必须在条件返回之前调用）
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

  if (loading) {
    return (
      <div className="work-detail-page">
        <div className="work-detail-loading">
          <div className="skeleton work-detail-skeleton-image" />
          <div className="work-detail-skeleton-info">
            <div className="skeleton" style={{ height: 32, width: '60%' }} />
            <div className="skeleton" style={{ height: 16, width: '40%' }} />
            <div className="skeleton" style={{ height: 100, width: '100%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="work-detail-page">
        <div className="work-detail-not-found">
          <p>{t('workDetail.notFound')}</p>
          <Link to="/" className="work-detail-back">{t('workDetail.backToHome')}</Link>
        </div>
      </div>
    )
  }

  const thumbnailImages = allImages

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
    <div className="work-detail-page">
      <motion.div
        className="work-detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 图片画廊 */}
        <div className="work-detail-gallery">
          <div className="work-detail-main-image" onClick={openPreview} style={{ cursor: imageCount > 0 ? 'zoom-in' : 'default' }}>
            <AnimatePresence mode="wait">
              {isEmojiCover && currentImage === 0 ? (
                <motion.div
                  key="emoji-cover"
                  className="work-detail-emoji-cover"
                  style={{ background: work.cover_bg }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="work-detail-emoji">{work.cover_emoji}</span>
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
                    const placeholder = document.createElement('div')
                    placeholder.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--text-muted);font-size:14px;'
                    placeholder.textContent = 'Image not available'
                    e.target.parentElement.appendChild(placeholder)
                  }}
                />
              ) : null}
            </AnimatePresence>

            {/* 缩放提示图标 */}
            {imageCount > 0 && allImages[currentImage] !== 'emoji-cover' && (
              <div className="work-detail-zoom-hint">
                <ZoomIn size={20} />
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button className="work-detail-nav work-detail-nav--prev" onClick={(e) => { e.stopPropagation(); handlePrevImage() }}>
                  <ChevronLeft size={24} />
                </button>
                <button className="work-detail-nav work-detail-nav--next" onClick={(e) => { e.stopPropagation(); handleNextImage() }}>
                  <ChevronRight size={24} />
                </button>
                <div className="work-detail-dots" onClick={(e) => e.stopPropagation()}>
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      className={`work-detail-dot ${index === currentImage ? 'work-detail-dot--active' : ''}`}
                      onClick={() => setCurrentImage(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {thumbnailImages.length > 1 && (
            <div className="work-detail-thumbnails">
              {thumbnailImages.map((url, index) => (
                <button
                  key={index}
                  className={`work-detail-thumb ${index === currentImage ? 'work-detail-thumb--active' : ''}`}
                  onClick={() => setCurrentImage(index)}
                >
                  {url === 'emoji-cover' ? (
                    <div className="work-detail-thumb-emoji" style={{ background: work.cover_bg }}>
                      {work.cover_emoji}
                    </div>
                  ) : (
                    <img src={url} alt="" onError={(e) => { e.target.style.display = 'none' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 作品信息 */}
        <div className="work-detail-info">
          <h1 className="work-detail-title">{work.title}</h1>

          {/* 作者信息 */}
          <Link to={`/profile/${work.user_id}`} className="work-detail-author">
            <div className="work-detail-author-avatar">
              {work.profiles?.avatar_url ? (
                <img src={work.profiles.avatar_url} alt="" />
              ) : (
                <span>{(work.profiles?.username || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="work-detail-author-name">{work.profiles?.username || t('common.anonymous')}</div>
              {work.profiles?.bio && (
                <div className="work-detail-author-bio">{work.profiles.bio}</div>
              )}
            </div>
          </Link>

          {/* 操作栏 */}
          <div className="work-detail-actions">
            <LikeButton workId={work.id} initialCount={work.likes_count} size="large" />
            {work.link && (
              <a
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="work-detail-link-btn"
              >
                <ExternalLink size={18} />
                {t('workDetail.visitLink')}
              </a>
            )}
          </div>

          {/* 作者操作 */}
          {user?.id === work.user_id && (
            <div className="work-detail-owner-actions">
              <button
                className="work-detail-edit-btn"
                onClick={() => navigate(`/edit/${work.id}`)}
              >
                <Edit3 size={16} />
                {t('workDetail.edit')}
              </button>
              <button
                className="work-detail-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                {t('workDetail.delete')}
              </button>
            </div>
          )}

          {/* 标签 */}
          {work.tags && work.tags.length > 0 && (
            <div className="work-detail-tags">
              <Tag size={16} />
              {work.tags.map(tag => (
                <Link key={tag} to={`/tag/${tag}`} className="work-detail-tag">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 平台类型 */}
          {work.platform && (
            <div className="work-detail-platform">
              {work.platform === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
              <span>{t(`platform.${work.platform}`)}</span>
            </div>
          )}

          {/* AI 开发工具 */}
          {work.ai_tools && work.ai_tools.length > 0 && (
            <div className="work-detail-section">
              <h3><Wrench size={16} /> {t('publish.aiTools')}</h3>
              <div className="work-detail-tool-badges">
                {work.ai_tools.map(tool => {
                  const config = getToolConfig(tool)
                  const ToolIcon = getToolIcon(tool)
                  return (
                    <span key={tool} className="work-detail-tool-badge" style={{ color: config.color, borderColor: `${config.color}30` }}>
                      {ToolIcon && <ToolIcon size={12} />}
                      {config.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 底层模型 */}
          {work.ai_models && work.ai_models.length > 0 && (
            <div className="work-detail-section">
              <h3><Bot size={16} /> {t('publish.aiModels')}</h3>
              <div className="work-detail-tool-badges">
                {work.ai_models.map(model => {
                  const config = getModelConfig(model)
                  const ModelIcon = getModelIcon(model)
                  return (
                    <span key={model} className="work-detail-tool-badge" style={{ color: config.color, borderColor: `${config.color}30` }}>
                      {ModelIcon && <ModelIcon size={12} />}
                      {config.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 描述 */}
          {work.description && (
            <div className="work-detail-description">
              <h3>{t('workDetail.description')}</h3>
              <p>{work.description}</p>
            </div>
          )}

          {/* 使用工具 */}
          {metadata?.tools?.length > 0 && (
            <div className="work-detail-section">
              <h3><Wrench size={16} /> {t('workDetail.toolsUsed')}</h3>
              <div className="work-detail-tool-badges">
                {metadata.tools.map(tool => (
                  <span key={tool} className="work-detail-tool-badge">{tool}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI 工作流 */}
          {metadata?.aiWorkflow && (
            <div className="work-detail-section">
              <h3><Bot size={16} /> {t('workDetail.aiWorkflow')}</h3>
              <p className="work-detail-workflow-text">{metadata.aiWorkflow}</p>
            </div>
          )}

          {/* Prompt */}
          {metadata?.prompt && (
            <div className="work-detail-section">
              <h3><Terminal size={16} /> {t('workDetail.prompt')}</h3>
              <pre className="work-detail-prompt-code">{metadata.prompt}</pre>
            </div>
          )}

          {/* 开发时长 + 技术栈 */}
          {(metadata?.devTime || metadata?.techStack?.length > 0) && (
            <div className="work-detail-meta-extra">
              {metadata?.devTime && (
                <div className="work-detail-meta-item">
                  <Clock size={14} />
                  <span>{t('workDetail.devTime')}: {metadata.devTime}</span>
                </div>
              )}
              {metadata?.techStack?.length > 0 && (
                <div className="work-detail-meta-item">
                  <Layers size={14} />
                  <div className="work-detail-tech-tags">
                    {metadata.techStack.map(tech => (
                      <span key={tech} className="work-detail-tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 发布时间 */}
          <div className="work-detail-meta">
            {t('workDetail.publishedAt', {
              date: new Date(work.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            })}
          </div>
        </div>

        {/* 相似作品 */}
        {relatedWorks.similar.length > 0 && (
          <div className="work-detail-related">
            <h3>{t('workDetail.similarWorks')}</h3>
            <MasonryGrid>
              {relatedWorks.similar.map((w, i) => (
                <div key={w.id} className="work-detail-related-item">
                  <WorkCard work={w} index={i} />
                </div>
              ))}
            </MasonryGrid>
          </div>
        )}

        {/* 作者更多作品 */}
        {relatedWorks.fromAuthor.length > 0 && (
          <div className="work-detail-related">
            <h3>{t('workDetail.moreFromAuthor')}</h3>
            <MasonryGrid>
              {relatedWorks.fromAuthor.map((w, i) => (
                <div key={w.id} className="work-detail-related-item">
                  <WorkCard work={w} index={i} />
                </div>
              ))}
            </MasonryGrid>
          </div>
        )}

        {/* 评论区 */}
        <CommentSection workId={work.id} />
      </motion.div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="work-detail-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div
            className="work-detail-confirm-dialog"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{t('workDetail.deleteTitle')}</h3>
            <p>{t('workDetail.deleteConfirm')}</p>
            <div className="work-detail-confirm-actions">
              <button
                className="work-detail-confirm-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="work-detail-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t('workDetail.deleting') : t('workDetail.confirmDelete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {showPreview && allImages[currentImage] && allImages[currentImage] !== 'emoji-cover' && (
          <motion.div
            className="image-preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <button className="image-preview-close" onClick={() => setShowPreview(false)}>
              <X size={24} />
            </button>

            <motion.img
              className="image-preview-img"
              src={allImages[currentImage]}
              alt={work.title}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {imageCount > 1 && (
              <>
                <button className="image-preview-nav image-preview-nav--prev" onClick={(e) => { e.stopPropagation(); handlePrevImage() }}>
                  <ChevronLeft size={32} />
                </button>
                <button className="image-preview-nav image-preview-nav--next" onClick={(e) => { e.stopPropagation(); handleNextImage() }}>
                  <ChevronRight size={32} />
                </button>
                <div className="image-preview-counter">
                  {currentImage + 1} / {allImages.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkDetail
