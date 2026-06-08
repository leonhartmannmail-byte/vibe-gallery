import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Compass, Search, ExternalLink, Loader2 } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { getBrandIcon, getFaviconUrl } from '../utils/lobeIcons'
import GridBackground from '../components/Background/GridBackground'
import './ListingPage.css'

function NavSites() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [failedIcons, setFailedIcons] = useState(new Set())

  const handleIconError = useCallback((id) => {
    setFailedIcons(prev => new Set(prev).add(id))
  }, [])

  const renderIcon = useCallback((item) => {
    // 1. 优先使用 icon_url（未失败时）
    if (item.icon_url && !failedIcons.has(item.id)) {
      return <img src={item.icon_url} alt="" onError={() => handleIconError(item.id)} />
    }
    // 2. 尝试 lobe 品牌图标
    const BIcon = getBrandIcon(item.name)
    if (BIcon) return <BIcon size={28} />
    // 3. 尝试网站 favicon
    const favicon = getFaviconUrl(item.url)
    if (favicon) return <img src={favicon} alt="" className="favicon-icon" />
    // 4. 最终兜底：首字母
    return <span>{item.name[0]}</span>
  }, [failedIcons, handleIconError])

  // 搜索防抖 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { items, total, loading, loadingMore, hasMore, loadMore, categories } = usePaginatedList('nav_sites', {
    search: debouncedSearch,
    category: activeCategory,
  })

  return (
    <div className="listing-page">
      <GridBackground />
      <div className="listing-container">
        <motion.div className="listing-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Compass size={28} className="listing-icon listing-icon--nav" />
          <div>
            <h1 className="listing-title">导航网站推荐</h1>
            <p className="listing-subtitle">精选 AI 工具与网站，共 {total} 个</p>
          </div>
        </motion.div>

        <motion.div className="listing-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="listing-search-wrap">
            <Search size={16} />
            <input className="listing-search-input" placeholder="搜索网站名称..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="listing-categories">
            <button className={`listing-cat-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>全部</button>
            {categories.map(cat => (
              <button key={cat} className={`listing-cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="listing-loading">加载中...</div>
        ) : items.length === 0 ? (
          <div className="listing-empty">没有找到相关网站</div>
        ) : (
          <>
            <motion.div className="listing-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              {items.map((item, i) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="listing-card" style={{ animationDelay: `${Math.min(i, 49) * 0.02}s` }}>
                  {item.is_recommended && <div className="listing-card-badge">推荐</div>}
                  <div className="listing-card-icon">
                    {renderIcon(item)}
                  </div>
                  <div className="listing-card-body">
                    <div className="listing-card-name">{item.name} <ExternalLink size={11} className="listing-card-ext" /></div>
                    <div className="listing-card-desc">{item.description}</div>
                    <div className="listing-card-tag">{item.category}</div>
                  </div>
                </a>
              ))}
            </motion.div>

            <div className="listing-load-more-wrap">
              {hasMore ? (
                <button className="listing-load-more-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <><Loader2 size={16} className="spin" /> 加载中...</> : '加载更多'}
                </button>
              ) : items.length > 0 && (
                <span className="listing-total-info">已显示全部 {total} 条</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NavSites
