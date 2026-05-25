import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import WorkCard from '../WorkCard/WorkCard'
import './FeaturedSection.css'

function FeaturedSection({ title, icon: Icon, workIds, works }) {
  const { t } = useLanguage()
  const filtered = works.filter(w => workIds.includes(w.id))

  if (filtered.length === 0) return null

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="home-section-header">
        <Icon size={20} className="home-section-icon" />
        <h2>{title}</h2>
      </div>
      <div className="home-section-scroll">
        {filtered.map((work, i) => (
          <div key={work.id} className="home-section-item">
            <WorkCard work={work} index={i} />
          </div>
        ))}
      </div>
    </motion.section>
  )
}

export default FeaturedSection
