import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { sbQuery, sbQueryAll } from '../lib/supabase'
import GridBackground from '../components/Background/GridBackground'
import './ListingPage.css'

function Prompts() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sbQueryAll('ai_prompts', { params: '?select=*&is_active=eq.true&order=sort_order.asc' })
      .then(data => {
        const list = (data || []).map(item => ({
          ...item,
          mainCategory: item.category ? item.category.split(',')[0].trim() : ''
        }))
        setItems(list)
        const cats = [...new Set(list.map(i => i.mainCategory).filter(Boolean))]
        setCategories(cats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || item.mainCategory === activeCategory
    return matchSearch && matchCat
  })

  const sorted = [...filtered].sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0))

  return (
    <div className="listing-page">
      <GridBackground />
      <div className="listing-container">
        <motion.div className="listing-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <MessageSquare size={28} className="listing-icon listing-icon--prompt" />
          <div>
            <h1 className="listing-title">AI 提示词</h1>
            <p className="listing-subtitle">高质量 Prompt 精选，共 {items.length} 个</p>
          </div>
        </motion.div>

        <motion.div className="listing-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="listing-search-wrap">
            <Search size={16} />
            <input className="listing-search-input" placeholder="搜索提示词名称..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <div className="listing-empty">没有找到相关提示词</div>
        ) : (
          <motion.div className="listing-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
            {sorted.map((item, i) => (
              <Link key={item.id} to={`/prompts/${item.id}`} className="listing-card" style={{ animationDelay: `${i * 0.03}s` }}>
                {item.is_recommended && <div className="listing-card-badge">推荐</div>}
                <div className="listing-card-icon">
                  {item.icon_url ? <img src={item.icon_url} alt="" /> : <span>{item.name[0]}</span>}
                </div>
                <div className="listing-card-body">
                  <div className="listing-card-name">{item.name}</div>
                  <div className="listing-card-desc">{item.description}</div>
                  {item.content && <div className="listing-card-content">{item.content}</div>}
                  <div className="listing-card-tag">{item.mainCategory}</div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Prompts
