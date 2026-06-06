import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Flame, ArrowRight, Bot, Zap, Rocket, Eye, FlaskConical, Star, Trophy, Smartphone, Monitor, Globe } from 'lucide-react'
import { Cursor as LobeCursor, ClaudeCode as LobeClaudeCode } from '@lobehub/icons'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { sbQuery } from '../lib/supabase'
import WorkCard from '../components/WorkCard/WorkCard'
import FilterBar from '../components/FilterBar/FilterBar'
import GridBackground from '../components/Background/GridBackground'
import SplashCursor from '../components/SplashCursor/SplashCursor'
import { FEATURED_WORK_IDS } from '../config/featured'
import { NavSitesSection, PromptsSection, McpSection, SkillsSection } from '../components/HomeModules/HomeModules'
import './Home.css'

const trendingTags = [
  { tag: 'AIBuild', icon: Sparkles },
  { tag: 'AgentWorkflow', icon: Bot },
  { tag: 'PromptBuild', icon: Zap },
  { tag: 'CursorBuild', icon: LobeCursor },
  { tag: 'ClaudeCode', icon: LobeClaudeCode },
  { tag: 'MobileApp', icon: Smartphone },
  { tag: 'WebApp', icon: Globe },
  { tag: 'BuildInPublic', icon: Eye },
  { tag: 'Experimental', icon: FlaskConical },
  { tag: 'SideProject', icon: Rocket },
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

function splitByPlatform(works) {
  const result = { web: [], mobile: [] }
  works.forEach(w => {
    if (w.platform === 'mobile') {
      result.mobile.push(w)
    } else {
      result.web.push(w)
    }
  })
  return result
}

function Home() {
  const { t } = useLanguage()
  const { fetchWorksByIds } = useWorks()

  // 恢复从详情页返回时的滚动位置
  useScrollRestoration('home')

  const [featuredByPlatform, setFeaturedByPlatform] = useState(null)
  const [trendingByPlatform, setTrendingByPlatform] = useState(null)
  const [topCreators, setTopCreators] = useState([])
  const [homeConfig, setHomeConfig] = useState({})
  const [activeFeaturedTab, setActiveFeaturedTab] = useState('web')
  const [activeTrendingTab, setActiveTrendingTab] = useState('web')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1. Featured works — only show admin-recommended works, no fallback
        const featuredData = await sbQuery('works', {
          params: '?select=*&is_featured=eq.true&order=likes_count.desc&limit=20'
        })
        if (featuredData && featuredData.length > 0) {
          setFeaturedByPlatform(splitByPlatform(await enrichWithProfiles(featuredData)))
        } else {
          setFeaturedByPlatform({ web: [], mobile: [] })
        }

        // Parallel queries
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
        const [trendingData, allWorksLite] = await Promise.all([
          sbQuery('works', {
            params: `?select=*&created_at=gte.${sevenDaysAgo}&order=likes_count.desc&limit=20`
          }),
          sbQuery('works', { params: '?select=user_id,likes_count' }),
        ])

        // 2. Trending this week
        let trending = trendingData || []
        if (trending.length < 10) {
          const fallback = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=20'
          })
          trending = fallback || []
        }
        setTrendingByPlatform(splitByPlatform(await enrichWithProfiles(trending)))

        // 3. Top Creators
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

        // 4. Home module config
        try {
          const configData = await sbQuery('home_config', {
            params: '?select=*&order=sort_order.asc'
          })
          if (configData) {
            const configMap = {}
            configData.forEach(c => { configMap[c.module_key] = c })
            setHomeConfig(configMap)
          }
        } catch (e) {
          // home_config table may not exist yet, silently ignore
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

      {/* Featured Works */}
      {homeConfig.featured?.is_visible !== false && featuredByPlatform && (featuredByPlatform.web.length > 0 || featuredByPlatform.mobile.length > 0) && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="home-section-header">
            <Star size={20} className="home-section-icon" />
            <h2>{t('home.featured')}</h2>
            <span className="home-section-subtitle">{t('home.editorPicks')}</span>
          </div>
          <div className="home-section-tabs">
            <button
              className={`home-section-tab ${activeFeaturedTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveFeaturedTab('web')}
            >
              <Monitor size={14} />
              <span>Web & Desktop</span>
            </button>
            <button
              className={`home-section-tab ${activeFeaturedTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveFeaturedTab('mobile')}
            >
              <Smartphone size={14} />
              <span>Mobile Apps</span>
            </button>
          </div>
          <div className="home-works-grid">
            {(activeFeaturedTab === 'web' ? featuredByPlatform.web : featuredByPlatform.mobile).slice(0, 10).map((work, i) => (
              <div key={work.id} className="home-works-grid-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Trending This Week */}
      {homeConfig.trending?.is_visible !== false && trendingByPlatform && (trendingByPlatform.web.length > 0 || trendingByPlatform.mobile.length > 0) && (
        <motion.section
          className="home-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="home-section-header">
            <Flame size={20} className="home-section-icon home-section-icon--trending" />
            <h2>{t('home.trendingThisWeek')}</h2>
            <Link to="/explore?sort=popular" className="home-section-view-all">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-section-tabs">
            <button
              className={`home-section-tab ${activeTrendingTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveTrendingTab('web')}
            >
              <Monitor size={14} />
              <span>Web & Desktop</span>
            </button>
            <button
              className={`home-section-tab ${activeTrendingTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveTrendingTab('mobile')}
            >
              <Smartphone size={14} />
              <span>Mobile Apps</span>
            </button>
          </div>
          <div className="home-works-grid">
            {(activeTrendingTab === 'web' ? trendingByPlatform.web : trendingByPlatform.mobile).slice(0, 10).map((work, i) => (
              <div key={work.id} className="home-works-grid-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Creators — Leaderboard */}
      {homeConfig.creators?.is_visible !== false && topCreators.length > 0 && (
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

      {/* New Modules — configurable from admin */}
      {homeConfig.nav_sites?.is_visible !== false && (
        <NavSitesSection delay={0.5} />
      )}
      {homeConfig.ai_prompts?.is_visible !== false && (
        <PromptsSection delay={0.55} />
      )}
      {homeConfig.mcp_servers?.is_visible !== false && (
        <McpSection delay={0.6} />
      )}
      {homeConfig.skills?.is_visible !== false && (
        <SkillsSection delay={0.65} />
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
