import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Flame, ArrowRight, Terminal, Bot, Zap, Cpu, Plug, Rocket, Eye, FlaskConical, Star, Users } from 'lucide-react'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { sbQuery } from '../lib/supabase'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import WorkCard from '../components/WorkCard/WorkCard'
import GridBackground from '../components/Background/GridBackground'
import SplashCursor from '../components/SplashCursor/SplashCursor'
import { FEATURED_WORK_IDS } from '../config/featured'
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
  const { t } = useLanguage()
  const { fetchWorksByIds } = useWorks()
  const [bentoWorks, setBentoWorks] = useState([])
  const [trendingWorks, setTrendingWorks] = useState([])
  const [featuredCreators, setFeaturedCreators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Bento works
        let works = []
        if (FEATURED_WORK_IDS.length > 0) {
          works = await fetchWorksByIds(FEATURED_WORK_IDS)
        }
        if (works.length === 0) {
          const data = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=6'
          })
          const userIds = [...new Set((data || []).map(w => w.user_id))]
          if (userIds.length) {
            const profiles = await sbQuery('profiles', {
              params: `?select=id,username,avatar_url&id=in.(${userIds.join(',')})`
            })
            const profileMap = {}
            profiles?.forEach(p => { profileMap[p.id] = p })
            works = (data || []).map(w => ({ ...w, profiles: profileMap[w.user_id] || null }))
          } else {
            works = data || []
          }
        }
        setBentoWorks(works)

        // Trending this week (parallel)
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
        const [trendingData, allWorksLite] = await Promise.all([
          sbQuery('works', {
            params: `?select=*&created_at=gte.${sevenDaysAgo}&order=likes_count.desc&limit=8`
          }),
          sbQuery('works', { params: '?select=user_id,likes_count' }),
        ])

        // Trending: fallback to top works if < 3 in last 7 days
        let trending = trendingData || []
        if (trending.length < 3) {
          trending = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=8'
          }) || []
        }
        if (trending.length) {
          const tUserIds = [...new Set(trending.map(w => w.user_id))]
          const tProfiles = await sbQuery('profiles', {
            params: `?select=id,username,avatar_url&id=in.(${tUserIds.join(',')})`
          })
          const tMap = {}
          tProfiles?.forEach(p => { tMap[p.id] = p })
          setTrendingWorks(trending.map(w => ({ ...w, profiles: tMap[w.user_id] || null })))
        }

        // Featured Creators: aggregate by user_id
        if (allWorksLite) {
          const creatorMap = {}
          allWorksLite.forEach(w => {
            if (!creatorMap[w.user_id]) {
              creatorMap[w.user_id] = { userId: w.user_id, workCount: 0, totalLikes: 0 }
            }
            creatorMap[w.user_id].workCount++
            creatorMap[w.user_id].totalLikes += (w.likes_count || 0)
          })
          const topCreators = Object.values(creatorMap)
            .sort((a, b) => b.totalLikes - a.totalLikes)
            .slice(0, 6)
          if (topCreators.length) {
            const cIds = topCreators.map(c => c.userId)
            const cProfiles = await sbQuery('profiles', {
              params: `?select=id,username,avatar_url,bio&id=in.(${cIds.join(',')})`
            })
            const enriched = topCreators.map(c => ({
              ...c,
              profile: cProfiles?.find(p => p.id === c.userId) || null,
            }))
            setFeaturedCreators(enriched)
          }
        }
      } catch (err) {
        console.error('Failed to load home data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchWorksByIds])

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
            <Link
              key={tag}
              to={`/tag/${tag}`}
              className="home-tag"
            >
              <Icon size={12} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Bento Grid — Featured / Trending */}
      {bentoWorks.length > 0 && (
        <motion.section
          className="home-bento-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="home-section-header">
            <Star size={20} className="home-section-icon" />
            <h2>{t('home.featured')}</h2>
          </div>
          <BentoGrid works={bentoWorks} />
        </motion.section>
      )}

      {loading && bentoWorks.length === 0 && (
        <div className="home-bento-section">
          <div className="home-section-header">
            <Star size={20} className="home-section-icon" />
            <h2>{t('home.featured')}</h2>
          </div>
          <div className="home-bento-skeleton">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`skeleton bento-skeleton-item bento-skeleton-${i}`} />
            ))}
          </div>
        </div>
      )}

      {/* Trending This Week */}
      {trendingWorks.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="home-section-header">
            <Flame size={20} className="home-section-icon home-section-icon--trending" />
            <h2>{t('home.trendingThisWeek')}</h2>
            <Link to="/explore?sort=popular" className="home-section-view-all">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-section-scroll">
            {trendingWorks.map((work, i) => (
              <div key={work.id} className="home-section-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Creators */}
      {featuredCreators.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="home-section-header">
            <Users size={20} className="home-section-icon home-section-icon--creators" />
            <h2>{t('home.featuredCreators')}</h2>
          </div>
          <div className="home-section-scroll">
            {featuredCreators.map((creator) => (
              <Link
                key={creator.userId}
                to={`/profile/${creator.userId}`}
                className="creator-card"
              >
                <div className="creator-card-avatar">
                  {creator.profile?.avatar_url ? (
                    <img src={creator.profile.avatar_url} alt="" />
                  ) : (
                    <span>{(creator.profile?.username || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="creator-card-info">
                  <span className="creator-card-name">{creator.profile?.username || t('common.anonymous')}</span>
                  <span className="creator-card-stats">
                    {t('home.worksCount', { n: creator.workCount })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Explore CTA */}
      <motion.div
        className="home-explore-cta"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Link to="/explore" className="home-explore-btn">
          <span>{t('home.browseAll')}</span>
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  )
}

export default Home
