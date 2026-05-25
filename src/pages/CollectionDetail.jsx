import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { COLLECTIONS } from '../config/featured'
import WorkCard from '../components/WorkCard/WorkCard'
import './CollectionDetail.css'

function CollectionDetail() {
  const { id } = useParams()
  const { t, locale } = useLanguage()
  const { fetchWorksByIds } = useWorks()
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)

  const collection = COLLECTIONS.find(c => c.id === id)

  useEffect(() => {
    if (collection) {
      setLoading(true)
      fetchWorksByIds(collection.workIds).then(data => {
        setWorks(data)
        setLoading(false)
      })
    }
  }, [collection, fetchWorksByIds])

  if (!collection) {
    return (
      <div className="collection-detail-page">
        <div className="collection-detail-not-found">
          <p>{t('collection.backToHome')}</p>
          <Link to="/" className="collection-detail-back">{t('collection.backToHome')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="collection-detail-page">
      <motion.div
        className="collection-detail-header"
        style={{ background: collection.coverGradient }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="collection-detail-back-link">
          <ArrowLeft size={18} />
          {t('collection.backToHome')}
        </Link>
        <h1>{collection.title[locale]}</h1>
        <p>{collection.description[locale]}</p>
        <span className="collection-detail-count">
          {works.length} {t('collection.works')}
        </span>
      </motion.div>

      <div className="collection-detail-content">
        {loading ? (
          <div className="collection-detail-loading">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="collection-detail-skeleton">
                <div className="skeleton" style={{ aspectRatio: '16/10' }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="collection-detail-grid">
            {works.map((w, i) => (
              <WorkCard key={w.id} work={w} index={i} />
            ))}
          </div>
        ) : (
          <div className="collection-detail-empty">
            <p>{t('home.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionDetail
