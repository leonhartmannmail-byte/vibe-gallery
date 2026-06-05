import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, Search, ExternalLink } from 'lucide-react'
import { sbQuery } from '../lib/supabase'
import GridBackground from '../components/Background/GridBackground'
import './ListingPage.css'

function NavSites() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sbQuery('nav_sites', { params: '?select=*&is_active=eq.true&order=sort_order.asc' })
      .then(data => {
        const list = data || []
        setItems(list)
        const cats = [...new Set(list.map(i => i.category).filter(Boolean))]
        setCategories(cats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    return matchSearch && matchCat
  })

  const sorted = [...filtered].sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0))

  return (
    <div className="listing-page">
      <GridBackground />
      <div className="listing-container">
        <motion.div className="listing-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Compass size={28} className="listing-icon listing-icon--nav" />
          <div>
            <h1 className="listing-title">导航网站推荐</h1>
            <p className="listing-subtitle">精选 AI 工具与网站，共 {items.length} 个</p>
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
        ) : sorted.length === 0 ? (
          <div className="listing-empty">没有找到相关网站</div>
        ) : (
          <motion.div className="listing-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
            {sorted.map((item, i) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="listing-card" style={{ animationDelay: `${i * 0.03}s` }}>
                {item.is_recommended && <div className="listing-card-badge">推荐</div>}
                <div className="listing-card-icon">
                  {item.icon_url ? <img src={item.icon_url} alt="" /> : <span>{item.name[0]}</span>}
                </div>
                <div className="listing-card-body">
                  <div className="listing-card-name">{item.name} <ExternalLink size={11} className="listing-card-ext" /></div>
                  <div className="listing-card-desc">{item.description}</div>
                  <div className="listing-card-tag">{item.category}</div>
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default NavSites
