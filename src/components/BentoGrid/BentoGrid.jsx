import { motion } from 'framer-motion'
import WorkCard from '../WorkCard/WorkCard'
import './BentoGrid.css'

const sizeMap = ['bento-large', 'bento-tall', 'bento-small', 'bento-small', 'bento-wide', 'bento-small']

function BentoGrid({ works }) {
  return (
    <div className="bento-grid">
      {works.slice(0, 6).map((work, i) => (
        <motion.div
          key={work.id}
          className={`bento-item ${sizeMap[i % 6]}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <WorkCard work={work} index={i} layout="bento" />
        </motion.div>
      ))}
    </div>
  )
}

export default BentoGrid
