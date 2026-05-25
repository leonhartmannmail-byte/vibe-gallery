import { useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, MessageCircle, ArrowRight, Star, Award, TrendingUp, Sparkles, Flame, Smartphone } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { getWorkBadge, formatCount } from '../../utils/badges'
import { getToolConfig } from '../../config/enums'
import './WorkCard.css'

const BADGE_ICONS = { Star, Award, TrendingUp, Sparkles, Flame }

function WorkCard({ work, index = 0, layout = 'grid' }) {
  const { t } = useLanguage()
  const { id, title, cover_url, cover_bg, cover_emoji, likes_count, comments_count, profiles, tags, platform, ai_tools } = work
  const cardRef = useRef(null)
  const badge = getWorkBadge(work)
  const BadgeIcon = badge ? BADGE_ICONS[badge.icon] : null
  const isMobile = platform === 'mobile'
  const tools = (ai_tools || []).slice(0, 2)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 300, damping: 30 }
  const glowX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig)
  const glowY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig)
  const glowOpacity = useSpring(0, springConfig)

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
    glowOpacity.set(1)
  }, [mouseX, mouseY, glowOpacity])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5)
    mouseY.set(0.5)
    glowOpacity.set(0)
  }, [mouseX, mouseY, glowOpacity])

  const gradientTemplate = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(400px circle at ${x}% ${y}%, var(--glow-color), transparent 60%)`
  )

  const likeCount = formatCount(likes_count)
  const commentCount = formatCount(comments_count)

  return (
    <motion.div
      ref={cardRef}
      className={`work-card ${isMobile ? 'work-card--mobile' : ''} ${layout === 'horizontal' ? 'work-card--horizontal' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="work-card-glow"
        style={{ background: gradientTemplate, opacity: glowOpacity }}
      />

      <Link to={`/work/${id}`} className="work-card-link">
        {/* Cover */}
        <div className="work-card-cover">
          {cover_bg && cover_emoji ? (
            <div className="work-card-emoji-cover" style={{ background: cover_bg }}>
              <span className="work-card-emoji">{cover_emoji}</span>
            </div>
          ) : (
            <img
              src={cover_url}
              alt={title}
              className="work-card-image"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.style.background = 'var(--bg-surface)'
              }}
            />
          )}
          <div className="work-card-cover-fade" />

          {/* Badge */}
          {badge && (
            <div className={`work-card-badge work-card-badge--${badge.type}`}>
              <BadgeIcon size={12} />
              <span>{t(`badge.${badge.type}`)}</span>
            </div>
          )}

          {/* Mobile indicator */}
          {isMobile && (
            <div className="work-card-platform-badge">
              <Smartphone size={10} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="work-card-body">
          <div className="work-card-header">
            <h3 className="work-card-title">{title}</h3>
            {likeCount && (
              <div className="work-card-heat">
                <Heart size={12} />
                <span>{likeCount}</span>
              </div>
            )}
          </div>

          {/* AI Tool badges */}
          {tools.length > 0 && (
            <div className="work-card-tools">
              {tools.map(tool => {
                const config = getToolConfig(tool)
                return (
                  <span key={tool} className="work-card-tool-badge" style={{ color: config.color, borderColor: `${config.color}30` }}>
                    {config.label}
                  </span>
                )
              })}
              {ai_tools.length > 2 && (
                <span className="work-card-tool-more">+{ai_tools.length - 2}</span>
              )}
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="work-card-tags">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="work-card-tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="work-card-footer">
            <div className="work-card-author">
              <div className="work-card-avatar">
                {profiles?.avatar_url ? (
                  <img src={profiles.avatar_url} alt="" />
                ) : (
                  <span>{(profiles?.username || '?')[0].toUpperCase()}</span>
                )}
              </div>
              <span className="work-card-username">{profiles?.username || t('common.anonymous')}</span>
            </div>

            <div className="work-card-stats">
              {commentCount && (
                <span className="work-card-stat">
                  <MessageCircle size={12} />
                  {commentCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="work-card-action">
          <span className="work-card-action-text">{t('workCard.viewDetails')}</span>
          <ArrowRight size={14} className="work-card-action-arrow" />
        </div>
      </Link>
    </motion.div>
  )
}

export default WorkCard
