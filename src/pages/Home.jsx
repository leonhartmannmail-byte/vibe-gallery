import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Sparkles, Star, BookOpen, Flame, ArrowRight, Terminal, Bot, Zap, Cpu, Plug, Rocket, Eye, FlaskConical, Smartphone, Monitor } from 'lucide-react'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import WorkCard from '../components/WorkCard/WorkCard'
import GridBackground from '../components/Background/GridBackground'
import SplashCursor from '../components/SplashCursor/SplashCursor'
import FeaturedSection from '../components/FeaturedSection/FeaturedSection'
import CollectionCard from '../components/CollectionCard/CollectionCard'
import { FEATURED_WORK_IDS, COLLECTIONS } from '../config/featured'
import './Home.css'

const trendingTags = [
  { label: 'CursorBuild', tag: 'CursorBuild', icon: Terminal },
  { label: 'ClaudeCode', tag: 'ClaudeCode', icon: Bot },
  { label: 'OnePrompt', tag: 'OnePrompt', icon: Zap },
  { label: 'AIWorkflow', tag: 'AIWorkflow', icon: Zap },
  { label: 'Agent', tag: 'Agent', icon: Cpu },
  { label: 'MCP', tag: 'MCP', icon: Plug },
  { label: 'SideProject', tag: 'SideProject', icon: Rocket },
  { label: 'BuildInPublic', tag: 'BuildInPublic', icon: Eye },
  { label: 'Experimental', tag: 'Experimental', icon: FlaskConical },
  { label: 'AIApps', tag: 'AIApps', icon: Sparkles },
]

function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || null)
  const { works, loading, hasMore, fetchWorks, fetchWorksByIds, fetchWorksByPlatform } = useWorks()
  const { t } = useLanguage()
  const [page, setPage] = useState(0)
  const [featuredWorks, setFeaturedWorks] = useState([])
  const [mobileWorks, setMobileWorks] = useState([])
  const [webWorks, setWebWorks] = useState([])

  useEffect(() => {
    setPage(0)
    fetchWorks({ page: 0, sort, tag: activeTag })
  }, [sort, activeTag, fetchWorks])

  useEffect(() => {
    if (FEATURED_WORK_IDS.length > 0) {
      fetchWorksByIds(FEATURED_WORK_IDS).then(setFeaturedWorks)
    }
    fetchWorksByPlatform({ platform: 'mobile', limit: 8 }).then(setMobileWorks)
    fetchWorksByPlatform({ platform: 'web', limit: 8 }).then(setWebWorks)
  }, [fetchWorksByIds, fetchWorksByPlatform])

  function handleSortChange(newSort) {
    setSort(newSort)
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    setSearchParams(params)
  }

  function handleTagClick(tag) {
    const newTag = activeTag === tag ? null : tag
    setActiveTag(newTag)
    const params = new URLSearchParams(searchParams)
    if (newTag) {
      params.set('tag', newTag)
    } else {
      params.delete('tag')
    }
    setSearchParams(params)
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchWorks({ page: nextPage, sort, tag: activeTag })
  }

  const workIdSet = new Set(works.map(w => w.id))
  const uniqueFeatured = featuredWorks.filter(fw => !workIdSet.has(fw.id))
  const allWorks = [...uniqueFeatured, ...works]

  return (
    <div className="home-page">
      <GridBackground />
      <div className="home-splash">
        <SplashCursor
          SIM_RESOLUTION={128}
          DYE_RESOLUTION={1440}
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
        />
      </div>

      {/* Hero */}
      <motion.section
        className="home-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="home-hero-tagline">
          <Sparkles size={12} />
          <span>{t('home.heroTagline')}</span>
        </div>
        <h1 className="home-hero-title">
          <span className="home-hero-title-en">Build crazy ideas</span>
          <span className="home-hero-title-en home-hero-title-accent">with AI</span>
        </h1>
        <p className="home-hero-subtitle">{t('home.subtitle')}</p>
        <Link to="/publish" className="home-hero-cta">
          <span>{t('home.heroCta')}</span>
          <ArrowRight size={16} />
        </Link>
      </motion.section>

      {/* Trending Tags */}
      <motion.section
        className="home-trending"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="home-trending-header">
          <Flame size={14} className="home-trending-icon" />
          <span>{t('home.trending')}</span>
        </div>
        <div className="home-trending-scroll">
          {trendingTags.map(({ label, tag, icon: Icon }) => (
            <button
              key={tag}
              className={`home-tag ${activeTag === tag ? 'home-tag--active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Featured */}
      <FeaturedSection title={t('home.featured')} icon={Star} workIds={FEATURED_WORK_IDS} works={allWorks} />

      {/* Mobile Apps */}
      {mobileWorks.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="home-section-header">
            <Smartphone size={20} className="home-section-icon" />
            <h2>{t('home.mobileApps')}</h2>
          </div>
          <div className="home-section-scroll">
            {mobileWorks.map((work, i) => (
              <div key={work.id} className="home-section-item home-section-item--mobile">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Web & Desktop */}
      {webWorks.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="home-section-header">
            <Monitor size={20} className="home-section-icon" />
            <h2>{t('home.webDesktop')}</h2>
          </div>
          <div className="home-section-scroll">
            {webWorks.map((work, i) => (
              <div key={work.id} className="home-section-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Collections */}
      {COLLECTIONS.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="home-section-header">
            <BookOpen size={20} className="home-section-icon" />
            <h2>{t('home.collections')}</h2>
          </div>
          <div className="home-section-scroll">
            {COLLECTIONS.map(col => (
              <CollectionCard key={col.id} collection={col} works={allWorks} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Sort + Grid */}
      <motion.div
        className="home-sort"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button className={`home-sort-btn ${sort === 'latest' ? 'home-sort-btn--active' : ''}`} onClick={() => handleSortChange('latest')}>
          <Clock size={16} /> {t('home.sortLatest')}
        </button>
        <button className={`home-sort-btn ${sort === 'popular' ? 'home-sort-btn--active' : ''}`} onClick={() => handleSortChange('popular')}>
          <TrendingUp size={16} /> {t('home.sortPopular')}
        </button>
      </motion.div>

      <div className="home-content">
        {works.length > 0 ? (
          <div className="home-grid">
            {works.map((work, index) => (
              <WorkCard key={work.id} work={work} index={index} />
            ))}
          </div>
        ) : !loading ? (
          <div className="home-empty"><p>{t('home.empty')}</p></div>
        ) : null}

        {loading && (
          <div className="home-loading">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="home-skeleton">
                <div className="skeleton home-skeleton-image" />
                <div className="home-skeleton-info">
                  <div className="skeleton home-skeleton-title" />
                  <div className="skeleton home-skeleton-text" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasMore && works.length > 0 && (
          <div className="home-load-more">
            <motion.button className="home-load-more-btn" onClick={handleLoadMore} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {t('home.loadMore')}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
