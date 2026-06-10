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

// ====== 精选作品模块 ======
function FeaturedSection({ data, delay = 0.25, title }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('web')
  if (!data || (data.web.length === 0 && data.mobile.length === 0)) return null
  return (
    <motion.section className="home-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <div className="home-section-header">
        <Star size={20} className="home-section-icon" />
        <h2>{title || t('home.featured')}</h2>
        <span className="home-section-subtitle">{t('home.editorPicks')}</span>
      </div>
      <div className="home-section-tabs">
        <button className={`home-section-tab ${activeTab === 'web' ? 'active' : ''}`} onClick={() => setActiveTab('web')}><Monitor size={14} /><span>Web & Desktop</span></button>
        <button className={`home-section-tab ${activeTab === 'mobile' ? 'active' : ''}`} onClick={() => setActiveTab('mobile')}><Smartphone size={14} /><span>Mobile Apps</span></button>
      </div>
      <div className="home-works-grid">
        {(activeTab === 'web' ? data.web : data.mobile).slice(0, 10).map((work, i) => (
          <div key={work.id} className="home-works-grid-item"><WorkCard work={work} index={i} /></div>
        ))}
      </div>
    </motion.section>
  )
}

// ====== 本周热门模块 ======
function TrendingSection({ data, delay = 0.35, title }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('web')
  if (!data || (data.web.length === 0 && data.mobile.length === 0)) return null
  return (
    <motion.section className="home-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <div className="home-section-header">
        <Flame size={20} className="home-section-icon home-section-icon--trending" />
        <h2>{title || t('home.trendingThisWeek')}</h2>
        <Link to="/explore?sort=popular" className="home-section-view-all">{t('home.viewAll')} <ArrowRight size={14} /></Link>
      </div>
      <div className="home-section-tabs">
        <button className={`home-section-tab ${activeTab === 'web' ? 'active' : ''}`} onClick={() => setActiveTab('web')}><Monitor size={14} /><span>Web & Desktop</span></button>
        <button className={`home-section-tab ${activeTab === 'mobile' ? 'active' : ''}`} onClick={() => setActiveTab('mobile')}><Smartphone size={14} /><span>Mobile Apps</span></button>
      </div>
      <div className="home-works-grid">
        {(activeTab === 'web' ? data.web : data.mobile).slice(0, 10).map((work, i) => (
          <div key={work.id} className="home-works-grid-item"><WorkCard work={work} index={i} /></div>
        ))}
      </div>
    </motion.section>
  )
}

// ====== 活跃创作者模块 ======
function CreatorsSection({ creators, delay = 0.45, title }) {
  const { t } = useLanguage()
  if (!creators || creators.length === 0) return null
  return (
    <motion.section className="home-section home-section--creators" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <div className="home-section-header">
        <Trophy size={20} className="home-section-icon home-section-icon--creators" />
        <h2>{title || t('home.topCreators')}</h2>
      </div>
      <div className="creator-leaderboard">
        {creators.map((creator, i) => (
          <Link key={creator.userId} to={`/profile/${creator.userId}`} className="creator-rank-row">
            <span className={`creator-rank-num creator-rank-num--${i + 1}`}>
              {i < 3 ? (() => { const I = RANK_ICONS[i]; return <I size={16} /> })() : `#${i + 1}`}
            </span>
            <div className="creator-rank-avatar">
              {creator.profile?.avatar_url ? <img src={creator.profile.avatar_url} alt="" /> : <span>{(creator.profile?.username || '?')[0].toUpperCase()}</span>}
            </div>
            <div className="creator-rank-info">
              <span className="creator-rank-name">{creator.profile?.username || t('common.anonymous')}</span>
              <span className="creator-rank-meta">{t('home.worksCount', { n: creator.workCount })} · {creator.totalLikes} {t('home.totalLikes')}</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}

// ====== 所有模块动态排序渲染 ======
function DynamicModules({ homeConfig, featuredByPlatform, trendingByPlatform, topCreators }) {
  const { locale } = useLanguage()

  // 根据当前语言解析模块标题
  function resolveTitle(cfg) {
    if (locale === 'en') {
      // 优先使用自定义英文名称，否则返回 null 让组件使用内置 i18n 默认值
      return cfg.config?.name_en || null
    }
    // 中文：直接使用 module_name
    return cfg.module_name
  }

  // 构建包含所有模块的排序列表
  const allModules = Object.values(homeConfig)
    .filter(c => c.is_visible !== false)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))

  const delayBase = 0.25
  return allModules.map((cfg, i) => {
    const delay = delayBase + i * 0.05
    const title = resolveTitle(cfg)
    switch (cfg.module_key) {
      case 'featured':
        return <FeaturedSection key="featured" data={featuredByPlatform} delay={delay} title={title} />
      case 'trending':
        return <TrendingSection key="trending" data={trendingByPlatform} delay={delay} title={title} />
      case 'creators':
        return <CreatorsSection key="creators" creators={topCreators} delay={delay} title={title} />
      case 'nav_sites':
        return <NavSitesSection key="nav_sites" delay={delay} title={title} />
      case 'ai_prompts':
        return <PromptsSection key="ai_prompts" delay={delay} title={title} />
      case 'mcp_servers':
        return <McpSection key="mcp_servers" delay={delay} title={title} />
      case 'skills':
        return <SkillsSection key="skills" delay={delay} title={title} />
      default:
        return null
    }
  })
}

// ====== 首页骨架屏 ======
function HomeSkeleton() {
  return (
    <div className="home-skeleton">
      {/* Hero 骨架 */}
      <div className="home-skel-hero">
        <div className="skeleton home-skel-tagline" />
        <div className="skeleton home-skel-title" />
        <div className="skeleton home-skel-title home-skel-title--short" />
        <div className="skeleton home-skel-subtitle" />
        <div className="skeleton home-skel-cta" />
      </div>

      {/* Filter Bar 骨架 */}
      <div className="home-skel-filter">
        <div className="skeleton home-skel-filter-item" />
        <div className="skeleton home-skel-filter-item" />
        <div className="skeleton home-skel-filter-item" />
        <div className="skeleton home-skel-filter-item" />
      </div>

      {/* Trending Tags 骨架 */}
      <div className="home-skel-tags">
        <div className="skeleton home-skel-tag" />
        <div className="skeleton home-skel-tag" />
        <div className="skeleton home-skel-tag" />
        <div className="skeleton home-skel-tag" />
        <div className="skeleton home-skel-tag" />
        <div className="skeleton home-skel-tag" />
      </div>

      {/* Section 骨架 */}
      <div className="home-skel-section">
        <div className="skeleton home-skel-section-title" />
        <div className="home-skel-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="home-skel-card">
              <div className="skeleton home-skel-card-img" />
              <div className="home-skel-card-body">
                <div className="skeleton home-skel-card-title" />
                <div className="skeleton home-skel-card-meta" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creators 骨架 */}
      <div className="home-skel-section">
        <div className="skeleton home-skel-section-title" />
        <div className="home-skel-creators">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="home-skel-creator">
              <div className="skeleton home-skel-creator-avatar" />
              <div className="home-skel-creator-info">
                <div className="skeleton home-skel-creator-name" />
                <div className="skeleton home-skel-creator-meta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

        // ── 第一轮：所有独立查询并行 ──
        const [featuredData, trendingData, allWorksLite, homeConfigData] = await Promise.all([
          sbQuery('works', {
            params: '?select=*&is_featured=eq.true&order=likes_count.desc&limit=20'
          }),
          sbQuery('works', {
            params: `?select=*&created_at=gte.${sevenDaysAgo}&order=likes_count.desc&limit=20`
          }),
          sbQuery('works', { params: '?select=user_id,likes_count' }),
          sbQuery('home_config', { params: '?select=*&order=sort_order.asc' }).catch(() => null),
        ])

        if (cancelled) return

        // 处理首页模块配置
        if (homeConfigData) {
          const configMap = {}
          homeConfigData.forEach(c => { configMap[c.module_key] = c })
          setHomeConfig(configMap)
        }

        // 热门不足 10 条时走 fallback
        let trending = trendingData || []
        if (trending.length < 10) {
          const fallback = await sbQuery('works', {
            params: '?select=*&order=likes_count.desc&limit=20'
          })
          trending = fallback || []
        }

        if (cancelled) return

        // ── 第二轮：所有 profile enrichment 并行 ──
        const featuredForEnrich = (featuredData && featuredData.length > 0) ? featuredData : []
        const [featuredEnriched, trendingEnriched, creatorProfiles] = await Promise.all([
          featuredForEnrich.length ? enrichWithProfiles(featuredForEnrich) : Promise.resolve([]),
          trending.length ? enrichWithProfiles(trending) : Promise.resolve([]),
          (() => {
            if (!allWorksLite) return Promise.resolve(null)
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
            if (!top.length) return Promise.resolve(null)
            const cIds = top.map(c => c.userId)
            return sbQuery('profiles', {
              params: `?select=id,username,avatar_url,bio&id=in.(${cIds.join(',')})`
            }).then(cProfiles =>
              top.map(c => ({ ...c, profile: cProfiles?.find(p => p.id === c.userId) || null }))
            )
          })(),
        ])

        if (cancelled) return

        // ── 批量 setState ──
        setFeaturedByPlatform(
          featuredEnriched.length > 0
            ? splitByPlatform(featuredEnriched)
            : { web: [], mobile: [] }
        )
        setTrendingByPlatform(
          trendingEnriched.length > 0
            ? splitByPlatform(trendingEnriched)
            : { web: [], mobile: [] }
        )
        if (creatorProfiles) {
          setTopCreators(creatorProfiles)
        }
      } catch (err) {
        console.error('Failed to load home data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [fetchWorksByIds])

  // Loading 骨架屏
  if (loading) {
    return (
      <div className="home-page">
        <GridBackground />
        <HomeSkeleton />
      </div>
    )
  }

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

      {/* 所有模块 — 按管理后台 sort_order 动态排序 */}
      <DynamicModules
        homeConfig={homeConfig}
        featuredByPlatform={featuredByPlatform}
        trendingByPlatform={trendingByPlatform}
        topCreators={topCreators}
      />

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
