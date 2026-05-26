import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Flame, ArrowRight, Terminal, Bot, Zap, Cpu, Rocket, Eye, FlaskConical, Star, Trophy, Smartphone, Monitor, Globe, Wind } from 'lucide-react'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { sbQuery } from '../lib/supabase'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import WorkCard from '../components/WorkCard/WorkCard'
import FilterBar from '../components/FilterBar/FilterBar'
import GridBackground from '../components/Background/GridBackground'
import SplashCursor from '../components/SplashCursor/SplashCursor'
import { FEATURED_WORK_IDS } from '../config/featured'
import './Home.css'

const trendingTags = [
  { tag: 'AIBuild', icon: Sparkles },
  { tag: 'AgentWorkflow', icon: Bot },
  { tag: 'PromptBuild', icon: Zap },
  { tag: 'CursorBuild', icon: Terminal },
  { tag: 'ClaudeCode', icon: Bot },
  { tag: 'MobileApp', icon: Smartphone },
  { tag: 'WebApp', icon: Globe },
  { tag: 'BuildInPublic', icon: Eye },
  { tag: 'Experimental', icon: FlaskConical },
  { tag: 'SideProject', icon: Rocket },
]

const TOOL_TABS = ['Cursor', 'Claude Code', 'Codex', 'Windsurf', 'Aider']
const TOOL_ICONS = { Cursor: Terminal, 'Claude Code': Bot, Codex: Zap, Windsurf: Wind, Aider: Cpu }

const PLATFORM_TABS = [
  { value: 'mobile', icon: Smartphone, label: { zh: 'Mobile Apps', en: 'Mobile Apps' } },
  { value: 'web', icon: Monitor, label: { zh: 'Web & Desktop', en: 'Web & Desktop' } },
]

const RANK_ICONS = [Trophy, Star, Star]

async function enrichWithProfiles(works) {
  if (!works || works.length === 0) return []
  const userIds = [...new Set(works.map(w => w.user_id))]
  if (!userIds.length) return works
  const profiles = await sbQuery('profiles', {
    params: `?select=id,username,avatar_url&id=in.(${userIds.join(',')})`
  })
  const map = {}
  profiles?.forEach(p => { map[p.id] = p })
  return works.map(w => ({ ...w, profiles: map[w.user_id] || null }))
}

function Home() {
  const { t, locale } = useLanguage()
  const { fetchWorksByIds } = useWorks()
  const lang = locale === 'en' ? 'en' : 'zh'

  const [bentoWorks, setBentoWorks] = useState([])
  const [platformWorks, setPlatformWorks] = useState({ mobile: [], web: [] })
  const [toolWorks, setToolWorks] = useState({})
  const [trendingWorks, setTrendingWorks] = useState([])
  const [topCreators, setTopCreators] = useState([])
  const [activePlatform, setActivePlatform] = useState('mobile')
  const [activeTool, setActiveTool] = useState('Claude Code')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1. Featured works
        let featured = []
        if (FEATURED_WORK_IDS.length > 0) {
          featured = await fetchWorksByIds(FEATURED_WORK_IDS)
        }
        if (featured.length === 0) {
          const data = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=6'
          })
          featured = await enrichWithProfiles(data)
        }
        setBentoWorks(featured)

        // Parallel queries
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
        const [mobileData, webData, trendingData, allWorksLite] = await Promise.all([
          sbQuery('works', { params: '?select=*&platform=eq.mobile&order=likes_count.desc&limit=4' }),
          sbQuery('works', { params: '?select=*&platform=eq.web&order=likes_count.desc&limit=4' }),
          sbQuery('works', {
            params: `?select=*&created_at=gte.${sevenDaysAgo}&order=likes_count.desc&limit=8`
          }),
          sbQuery('works', { params: '?select=user_id,likes_count' }),
        ])

        // 2. Platform works
        setPlatformWorks({
          mobile: await enrichWithProfiles(mobileData),
          web: await enrichWithProfiles(webData),
        })

        // 3. Tool works (query top 5 tools)
        const toolResults = await Promise.all(
          TOOL_TABS.map(tool =>
            sbQuery('works', {
              params: `?select=*&ai_tools=cs.{"${tool}"}&order=likes_count.desc&limit=4`
            })
          )
        )
        const toolMap = {}
        for (let i = 0; i < TOOL_TABS.length; i++) {
          toolMap[TOOL_TABS[i]] = await enrichWithProfiles(toolResults[i])
        }
        setToolWorks(toolMap)

        // 4. Trending this week
        let trending = trendingData || []
        if (trending.length < 3) {
          const fallback = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=8'
          })
          trending = fallback || []
        }
        setTrendingWorks(await enrichWithProfiles(trending))

        // 5. Top Creators
        if (allWorksLite) {
          const creatorMap = {}
          allWorksLite.forEach(w => {
            if (!creatorMap[w.user_id]) {
              creatorMap[w.user_id] = { userId: w.user_id, workCount: 0, totalLikes: 0 }
            }
            creatorMap[w.user_id].workCount++
            creatorMap[w.user_id].totalLikes += (w.likes_count || 0)
          })
          const top = Object.values(creatorMap)
            .sort((a, b) => b.totalLikes - a.totalLikes)
            .slice(0, 5)
          if (top.length) {
            const cIds = top.map(c => c.userId)
            const cProfiles = await sbQuery('profiles', {
              params: `?select=id,username,avatar_url,bio&id=in.(${cIds.join(',')})`
            })
            setTopCreators(top.map(c => ({
              ...c,
              profile: cProfiles?.find(p => p.id === c.userId) || null,
            })))
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

  const mobileWorks = platformWorks.mobile
  const webWorks = platformWorks.web
  const currentToolWorks = toolWorks[activeTool] || []

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          <ArrowRight size={14} />
        </Link>
      </motion.section>

      {/* Filter Bar */}
      <motion.div
        className="home-filter-wrapper"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <FilterBar />
      </motion.div>

      {/* Trending Tags */}
      <motion.section
        className="home-trending"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="home-trending-header">
          <Flame size={14} className="home-trending-icon" />
          <span>{t('home.trendingNow')}</span>
        </div>
        <div className="home-trending-scroll">
          {trendingTags.map(({ tag, icon: Icon }) => (
            <Link key={tag} to={`/tag/${tag}`} className="home-tag">
              <Icon size={12} />
              <span>{tag}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Featured Works — BentoGrid */}
      {bentoWorks.length > 0 && (
        <motion.section
          className="home-bento-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="home-section-header">
            <Star size={20} className="home-section-icon" />
            <h2>{t('home.featured')}</h2>
            <span className="home-section-subtitle">{t('home.editorPicks')}</span>
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

      {/* By Platform */}
      {(mobileWorks.length > 0 || webWorks.length > 0) && (
        <motion.section
          className="home-section home-section--tabbed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="home-section-header">
            <Globe size={20} className="home-section-icon home-section-icon--platform" />
            <h2>{t('home.sectionByPlatform')}</h2>
          </div>
          <div className="home-section-tabs">
            {PLATFORM_TABS.map(tab => {
              const works = tab.value === 'mobile' ? mobileWorks : webWorks
              if (works.length === 0) return null
              return (
                <button
                  key={tab.value}
                  className={`home-section-tab ${activePlatform === tab.value ? 'active' : ''}`}
                  onClick={() => setActivePlatform(tab.value)}
                >
                  <tab.icon size={14} />
                  <span>{tab.label[lang]}</span>
                </button>
              )
            })}
          </div>
          <div className="home-section-grid">
            {(activePlatform === 'mobile' ? mobileWorks : webWorks).slice(0, 4).map((work, i) => (
              <div key={work.id} className="home-section-grid-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
          <div className="home-section-footer">
            <Link to={`/explore?platform=${activePlatform}`} className="home-section-view-all">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
        </motion.section>
      )}

      {/* By Tool */}
      {Object.values(toolWorks).some(w => w.length > 0) && (
        <motion.section
          className="home-section home-section--tabbed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="home-section-header">
            <Terminal size={20} className="home-section-icon home-section-icon--tool" />
            <h2>{t('home.sectionByTool')}</h2>
          </div>
          <div className="home-section-tabs">
            {TOOL_TABS.map(tool => {
              const works = toolWorks[tool] || []
              if (works.length === 0) return null
              const Icon = TOOL_ICONS[tool] || Terminal
              return (
                <button
                  key={tool}
                  className={`home-section-tab ${activeTool === tool ? 'active' : ''}`}
                  onClick={() => setActiveTool(tool)}
                >
                  <Icon size={14} />
                  <span>{tool}</span>
                </button>
              )
            })}
          </div>
          <div className="home-section-grid">
            {currentToolWorks.slice(0, 4).map((work, i) => (
              <div key={work.id} className="home-section-grid-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
          <div className="home-section-footer">
            <Link to={`/explore?tool=${encodeURIComponent(activeTool)}`} className="home-section-view-all">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Trending This Week */}
      {trendingWorks.length > 0 && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 15 }}
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

      {/* Top Creators — Leaderboard */}
      {topCreators.length > 0 && (
        <motion.section
          className="home-section home-section--creators"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className="home-section-header">
            <Trophy size={20} className="home-section-icon home-section-icon--creators" />
            <h2>{t('home.topCreators')}</h2>
          </div>
          <div className="creator-leaderboard">
            {topCreators.map((creator, i) => (
              <Link
                key={creator.userId}
                to={`/profile/${creator.userId}`}
                className="creator-rank-row"
              >
                <span className={`creator-rank-num creator-rank-num--${i + 1}`}>
                  {i < 3 ? (() => { const I = RANK_ICONS[i]; return <I size={16} /> })() : `#${i + 1}`}
                </span>
                <div className="creator-rank-avatar">
                  {creator.profile?.avatar_url ? (
                    <img src={creator.profile.avatar_url} alt="" />
                  ) : (
                    <span>{(creator.profile?.username || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="creator-rank-info">
                  <span className="creator-rank-name">{creator.profile?.username || t('common.anonymous')}</span>
                  <span className="creator-rank-meta">
                    {t('home.worksCount', { n: creator.workCount })} · {creator.totalLikes} {t('home.totalLikes')}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
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
