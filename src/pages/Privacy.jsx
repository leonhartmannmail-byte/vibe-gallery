import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import './Privacy.css'

function Privacy() {
  const { t } = useLanguage()

  return (
    <div className="privacy-page">
      <motion.div
        className="privacy-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="privacy-back">
          <ArrowLeft size={18} />
          {t('privacy.backToHome')}
        </Link>

        <div className="privacy-header">
          <Shield size={32} className="privacy-icon" />
          <h1 className="privacy-title">
            <span className="gradient-text">{t('privacy.title')}</span>
          </h1>
          <p className="privacy-date">{t('privacy.lastUpdated')}</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>{t('privacy.s1Title')}</h2>
            <p>{t('privacy.s1P1')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s2Title')}</h2>
            <h3>{t('privacy.s2_1Title')}</h3>
            <ul>
              <li><strong>{t('privacy.s2_1_1')}</strong></li>
              <li><strong>{t('privacy.s2_1_2')}</strong></li>
              <li><strong>{t('privacy.s2_1_3')}</strong></li>
            </ul>

            <h3>{t('privacy.s2_2Title')}</h3>
            <ul>
              <li><strong>{t('privacy.s2_2_1')}</strong></li>
              <li><strong>{t('privacy.s2_2_2')}</strong></li>
              <li><strong>{t('privacy.s2_2_3')}</strong></li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s3Title')}</h2>
            <p>{t('privacy.s3P1')}</p>
            <ul>
              <li>{t('privacy.s3_1')}</li>
              <li>{t('privacy.s3_2')}</li>
              <li>{t('privacy.s3_3')}</li>
              <li>{t('privacy.s3_4')}</li>
              <li>{t('privacy.s3_5')}</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s4Title')}</h2>
            <p>{t('privacy.s4P1')}</p>
            <p>{t('privacy.s4P2')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s5Title')}</h2>
            <p>{t('privacy.s5P1')}</p>
            <ul>
              <li><strong>{t('privacy.s5_1')}</strong></li>
              <li><strong>{t('privacy.s5_2')}</strong></li>
              <li><strong>{t('privacy.s5_3')}</strong></li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s6Title')}</h2>
            <p>{t('privacy.s6P1')}</p>
            <ul>
              <li><strong>{t('privacy.s6_1')}</strong></li>
              <li><strong>{t('privacy.s6_2')}</strong></li>
              <li><strong>{t('privacy.s6_3')}</strong></li>
              <li><strong>{t('privacy.s6_4')}</strong></li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s7Title')}</h2>
            <p>{t('privacy.s7P1')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s8Title')}</h2>
            <p>{t('privacy.s8P1')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s9Title')}</h2>
            <p>{t('privacy.s9P1')}</p>
          </section>

          <section className="privacy-section">
            <h2>{t('privacy.s10Title')}</h2>
            <p>{t('privacy.s10P1')}</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default Privacy
