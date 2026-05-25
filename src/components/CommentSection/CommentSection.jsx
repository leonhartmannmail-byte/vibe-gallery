import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWorks } from '../../hooks/useWorks'
import { useLanguage } from '../../hooks/useLanguage'
import './CommentSection.css'

function CommentSection({ workId }) {
  const { user } = useAuth()
  const { fetchComments, addComment } = useWorks()
  const { t, locale } = useLanguage()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!workId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await fetchComments(workId)
      if (!cancelled) {
        setComments(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [workId, fetchComments])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || !user) return

    setSubmitting(true)
    const { data, error } = await addComment(workId, content.trim())

    if (!error && data) {
      setComments([...comments, data])
      setContent('')
    }
    setSubmitting(false)
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('comment.justNow')
    if (minutes < 60) return t('comment.minutesAgo', { n: minutes })
    if (hours < 24) return t('comment.hoursAgo', { n: hours })
    if (days < 30) return t('comment.daysAgo', { n: days })
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        <MessageCircle size={20} />
        {t('comment.title', { count: comments.length })}
      </h3>

      {/* 评论列表 */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">
            {[1, 2].map(i => (
              <div key={i} className="comment-skeleton">
                <div className="skeleton comment-skeleton-avatar" />
                <div className="comment-skeleton-content">
                  <div className="skeleton comment-skeleton-name" />
                  <div className="skeleton comment-skeleton-text" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">{t('comment.empty')}</div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                className="comment-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="comment-avatar">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" />
                  ) : (
                    <span>{(comment.profiles?.username || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-username">
                      {comment.profiles?.username || t('common.anonymous')}
                    </span>
                    <span className="comment-time">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 发表评论 */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-avatar">
            {user.email[0].toUpperCase()}
          </div>
          <input
            type="text"
            className="comment-input"
            placeholder={t('comment.inputPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          <motion.button
            type="submit"
            className="comment-submit"
            disabled={!content.trim() || submitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={18} />
          </motion.button>
        </form>
      ) : (
        <div className="comment-login-hint" dangerouslySetInnerHTML={{ __html: t('comment.loginHint') }} />
      )}
    </div>
  )
}

export default CommentSection
