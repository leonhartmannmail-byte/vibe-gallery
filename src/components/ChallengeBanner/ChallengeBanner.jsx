import { motion } from 'framer-motion'
import { Zap, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import './ChallengeBanner.css'

function ChallengeBanner({ challenge }) {
  const { t, locale } = useLanguage()
  if (!challenge) return null

  const deadline = new Date(challenge.deadline)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)))

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="challenge-banner">
        <div className="challenge-banner-glow" />
        <div className="challenge-banner-content">
          <div className="challenge-banner-badge">
            <Zap size={14} />
            <span>{t('home.weeklyChallenge')}</span>
          </div>
          <h2 className="challenge-banner-title">
            {challenge.title[locale]}
          </h2>
          <p className="challenge-banner-desc">
            {challenge.description[locale]}
          </p>
          <div className="challenge-banner-footer">
            <div className="challenge-banner-deadline">
              <Clock size={14} />
              <span>
                {t('home.challengeDeadline')}：{daysLeft} {locale === 'zh' ? '天' : 'days'}
              </span>
            </div>
            <Link
              to={`/tag/${challenge.tag}`}
              className="challenge-banner-join"
            >
              {t('home.challengeJoin')}
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default ChallengeBanner
