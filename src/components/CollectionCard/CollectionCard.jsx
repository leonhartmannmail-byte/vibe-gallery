import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'
import './CollectionCard.css'

function CollectionCard({ collection, works }) {
  const { t, locale } = useLanguage()
  const previewWorks = works.filter(w => collection.workIds.includes(w.id)).slice(0, 3)

  return (
    <Link to={`/collection/${collection.id}`} className="collection-card">
      <div className="collection-card-bg" style={{ background: collection.coverGradient }}>
        <div className="collection-card-previews">
          {previewWorks.map(w => (
            <div key={w.id} className="collection-card-thumb">
              {w.cover_bg && w.cover_emoji ? (
                <div className="collection-card-thumb-emoji" style={{ background: w.cover_bg }}>
                  {w.cover_emoji}
                </div>
              ) : (
                <img src={w.cover_url} alt="" />
              )}
            </div>
          ))}
          {previewWorks.length === 0 && (
            <div className="collection-card-empty">
              <span>{collection.title[locale]?.[0] || '?'}</span>
            </div>
          )}
        </div>
      </div>
      <div className="collection-card-info">
        <h3>{collection.title[locale]}</h3>
        <p>{collection.description[locale]}</p>
        <span className="collection-card-count">
          {t('home.collectionWorks', { n: collection.workIds.length })}
        </span>
      </div>
    </Link>
  )
}

export default CollectionCard
