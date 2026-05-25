import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Hash } from 'lucide-react'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import WorkCard from '../components/WorkCard/WorkCard'
import './TagPage.css'

function TagPage() {
  const { tag } = useParams()
  const { works, loading, fetchWorks } = useWorks()
  const { t } = useLanguage()

  useEffect(() => {
    if (tag) {
      fetchWorks({ page: 0, sort: 'latest', tag })
    }
  }, [tag, fetchWorks])

  return (
    <div className="tag-page">
      <motion.div
        className="tag-page-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="tag-page-back">
          <ArrowLeft size={18} />
          {t('tagPage.backToHome')}
        </Link>

        <h1 className="tag-page-title">
          <Hash size={28} className="tag-page-icon" />
          <span className="gradient-text">{tag}</span>
        </h1>
        <p className="tag-page-subtitle">
          {t('tagPage.allWorks')}
        </p>
      </motion.div>

      <div className="tag-page-content">
        {loading ? (
          <div className="tag-page-loading">{t('common.loading')}</div>
        ) : works.length > 0 ? (
          <div className="tag-page-grid">
            {works.map((work, index) => (
              <WorkCard key={work.id} work={work} index={index} />
            ))}
          </div>
        ) : (
          <div className="tag-page-empty">
            <p>{t('tagPage.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TagPage
