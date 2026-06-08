import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useExplore } from '../hooks/useExplore'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { CONTENT_CATEGORIES, PLATFORM_TYPES, AI_TOOLS } from '../config/enums'
import MasonryGrid from '../components/MasonryGrid/MasonryGrid'
import WorkCard from '../components/WorkCard/WorkCard'
import './Explore.css'

function Explore() {
  const { t, locale } = useLanguage()
  const { works, loading, hasMore, fetchExplore } = useExplore()

  // 恢复从详情页返回时的滚动位置
  useScrollRestoration('explore')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)
  const [platform, setPlatform] = useState(null)
  const [tool, setTool] = useState(null)
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const sentinelRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const activeFilterCount = [category, platform, tool].filter(Boolean).length

  // Fetch on filter change
  useEffect(() => {
    setPage(0)
    fetchExplore({ page: 0, sort, category, platform, tool, search })
  }, [sort, category, platform, tool, fetchExplore])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setPage(0)
      fetchExplore({ page: 0, sort, category, platform, tool, search })
    }, 300)
    return () => clearTimeout(searchTimeoutRef.current)
  }, [search])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchExplore({ page: nextPage, sort, category, platform, tool, search })
      }
    }, { threshold: 0.1 })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, sort, category, platform, tool, search, fetchExplore])

  function clearFilters() {
    setCategory(null)
    setPlatform(null)
    setTool(null)
    setSearch('')
  }

  return (
    <div className="explore-page">
      {/* Header */}
      <motion.div
        className="explore-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="explore-title">
          <span className="gradient-text">{t('explore.title')}</span>
        </h1>
        <p className="explore-subtitle">{t('explore.subtitle')}</p>

        <div className="explore-search">
          <Search size={18} className="explore-search-icon" />
          <input
            type="text"
            placeholder={t('explore.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="explore-search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter Toggle */}
      <div className="explore-filter-bar">
        <button
          className={`explore-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
          <span>{t('explore.filterCategory')}</span>
          {activeFilterCount > 0 && (
            <span className="explore-filter-count">{activeFilterCount}</span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button className="explore-clear-btn" onClick={clearFilters}>
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          className="explore-filters"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Category */}
          <div className="explore-filter-group">
            <label>{t('explore.filterCategory')}</label>
            <div className="explore-filter-pills">
              {CONTENT_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`explore-pill ${category === cat.value ? 'active' : ''}`}
                  style={category === cat.value ? { borderColor: cat.color, color: cat.color, background: `${cat.color}15` } : {}}
                  onClick={() => setCategory(category === cat.value ? null : cat.value)}
                >
                  {cat.label[locale === 'en' ? 'en' : 'zh']}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="explore-filter-group">
            <label>{t('explore.filterPlatform')}</label>
            <div className="explore-filter-pills">
              {PLATFORM_TYPES.map(p => (
                <button
                  key={p.value}
                  className={`explore-pill ${platform === p.value ? 'active' : ''}`}
                  onClick={() => setPlatform(platform === p.value ? null : p.value)}
                >
                  {p.label[locale === 'en' ? 'en' : 'zh']}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tool */}
          <div className="explore-filter-group">
            <label>{t('explore.filterTool')}</label>
            <div className="explore-filter-pills">
              {AI_TOOLS.map(t => (
                <button
                  key={t.value}
                  className={`explore-pill ${tool === t.value ? 'active' : ''}`}
                  style={tool === t.value ? { borderColor: t.color, color: t.color, background: `${t.color}15` } : {}}
                  onClick={() => setTool(tool === t.value ? null : t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="explore-filter-group">
            <label>{t('explore.filterSort')}</label>
            <div className="explore-filter-pills">
              <button
                className={`explore-pill ${sort === 'latest' ? 'active' : ''}`}
                onClick={() => setSort('latest')}
              >
                {t('home.sortLatest')}
              </button>
              <button
                className={`explore-pill ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => setSort('popular')}
              >
                {t('home.sortPopular')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="explore-content">
        {works.length > 0 ? (
          <MasonryGrid>
            {works.map((work, i) => (
              <div key={work.id} className="explore-masonry-item">
                <WorkCard work={work} index={i} />
              </div>
            ))}
          </MasonryGrid>
        ) : !loading ? (
          <div className="explore-empty">
            <p>{t('explore.empty')}</p>
          </div>
        ) : null}

        {loading && (
          <div className="explore-loading">
            <div className="explore-loading-spinner" />
          </div>
        )}

        <div ref={sentinelRef} className="explore-sentinel" />
      </div>
    </div>
  )
}

export default Explore
