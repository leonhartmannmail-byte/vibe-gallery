import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wrench, Search, ExternalLink, Loader2 } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import GridBackground from '../components/Background/GridBackground'
import './ListingPage.css'

const transformSkill = (item) => ({
  ...item,
  mainCategory: item.category ? item.category.split(',')[0].trim() : ''
})

function Skills() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // 恢复从详情页返回时的滚动位置
  useScrollRestoration('skills')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { items, total, loading, loadingMore, hasMore, loadMore, categories } = usePaginatedList('skills_data', {
    search: debouncedSearch,
    category: activeCategory,
    transform: transformSkill,
  })

  return (
    <div className="listing-page">
      <GridBackground />
      <div className="listing-container">
        <motion.div className="listing-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Wrench size={28} className="listing-icon listing-icon--skills" />
          <div>
            <h1 className="listing-title">Skills 技能</h1>
            <p className="listing-subtitle">AI Agent 能力模块，共 {total} 个</p>
          </div>
        </motion.div>

        <motion.div className="listing-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="listing-search-wrap">
            <Search size={16} />
            <input className="listing-search-input" placeholder="搜索技能名称..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <div className="listing-empty">没有找到相关技能</div>
        ) : (
          <>
            <motion.div className="listing-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              {items.map((item, i) => (
                <Link key={item.id} to={`/skills/${item.id}`} className="listing-card" style={{ animationDelay: `${Math.min(i, 49) * 0.02}s` }}>
                  {item.is_recommended && <div className="listing-card-badge">推荐</div>}
                  <div className="listing-card-icon">
                    {item.icon_url ? <img src={item.icon_url} alt="" /> : <span>{item.name[0]}</span>}
                  </div>
                  <div className="listing-card-body">
                    <div className="listing-card-name">
                      {item.name} {item.url && <ExternalLink size={11} className="listing-card-ext" />}
                    </div>
                    <div className="listing-card-desc">{item.description}</div>
                    <div className="listing-card-tag">{item.mainCategory}</div>
                  </div>
                </Link>
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

export default Skills
