import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import './Terms.css'

function Terms() {
  const { t } = useLanguage()

  return (
    <div className="terms-page">
      <motion.div
        className="terms-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="terms-back">
          <ArrowLeft size={18} />
          {t('terms.backToHome')}
        </Link>

        <div className="terms-header">
          <FileText size={32} className="terms-icon" />
          <h1 className="terms-title">
            <span className="gradient-text">{t('terms.title')}</span>
          </h1>
          <p className="terms-date">{t('terms.lastUpdated')}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>{t('terms.s1Title')}</h2>
            <p>{t('terms.s1P1')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s2Title')}</h2>
            <p>{t('terms.s2P1')}</p>
            <ul>
              <li>{t('terms.s2_1')}</li>
              <li>{t('terms.s2_2')}</li>
              <li>{t('terms.s2_3')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s3Title')}</h2>
            <p>{t('terms.s3P1')}</p>
            <ul>
              <li>{t('terms.s3_1')}</li>
              <li>{t('terms.s3_2')}</li>
              <li>{t('terms.s3_3')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s4Title')}</h2>
            <p>{t('terms.s4P1')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s5Title')}</h2>
            <p>{t('terms.s5P1')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s6Title')}</h2>
            <p>{t('terms.s6P1')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s7Title')}</h2>
            <p>{t('terms.s7P1')}</p>
          </section>

          <section className="terms-section">
            <h2>{t('terms.s8Title')}</h2>
            <p>{t('terms.s8P1')}</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default Terms
