import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Compass, MessageSquare, Server, Wrench, ArrowRight, ExternalLink } from 'lucide-react'
import { sbQuery } from '../../lib/supabase'
import { getBrandIcon } from '../../utils/lobeIcons'
import './HomeModules.css'

// ====== 导航网站推荐 ======
export function NavSitesSection({ delay = 0.5 }) {
  const [sites, setSites] = useState([])

  useEffect(() => {
    sbQuery('nav_sites', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=10' })
      .then(data => setSites(data || []))
      .catch(err => console.error('[HomeModules] 导航网站加载失败:', err.message))
  }, [])

  if (sites.length === 0) return null

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="home-section-header">
        <Compass size={20} className="home-section-icon home-section-icon--nav" />
        <h2>导航网站推荐</h2>
        <span className="home-section-subtitle">精选 AI 工具与网站</span>
        <Link to="/nav-sites" className="home-section-view-all">
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="home-modules-grid">
        {sites.slice(0, 10).map((site, i) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="home-module-card"
          >
            {site.is_recommended && <div className="home-module-card-recommended">推荐</div>}
            <div className="home-module-card-icon">
              {site.icon_url ? (
                <img src={site.icon_url} alt="" />
              ) : (
                (() => { const BrandIcon = getBrandIcon(site.name); return BrandIcon ? <BrandIcon size={24} /> : <span>{site.name[0]}</span> })()
              )}
            </div>
            <div className="home-module-card-body">
              <div className="home-module-card-name">
                {site.name}
                <ExternalLink size={11} className="home-module-card-ext" />
              </div>
              <div className="home-module-card-desc">{site.description}</div>
              <div className="home-module-card-tag">{site.category}</div>
            </div>
          </a>
        ))}
      </div>
    </motion.section>
  )
}

// ====== AI 提示词 ======
export function PromptsSection({ delay = 0.55 }) {
  const [prompts, setPrompts] = useState([])

  useEffect(() => {
    sbQuery('ai_prompts', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=10' })
      .then(data => setPrompts(data || []))
      .catch(err => console.error('[HomeModules] AI提示词加载失败:', err.message))
  }, [])

  if (prompts.length === 0) return null

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="home-section-header">
        <MessageSquare size={20} className="home-section-icon home-section-icon--prompt" />
        <h2>AI 提示词</h2>
        <span className="home-section-subtitle">高质量 Prompt 精选</span>
        <Link to="/prompts" className="home-section-view-all">
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="home-modules-grid">
        {prompts.slice(0, 10).map((prompt, i) => (
          <Link
            key={prompt.id}
            to={`/prompts/${prompt.id}`}
            className="home-module-card home-module-card--prompt"
          >
            {prompt.is_recommended && <div className="home-module-card-recommended">推荐</div>}
            <div className="home-module-card-body">
              <div className="home-module-card-name">{prompt.name}</div>
              <div className="home-module-card-desc">{prompt.description}</div>
              {prompt.content && (
                <div className="home-module-card-content">{prompt.content}</div>
              )}
              <div className="home-module-card-tag">{prompt.category?.split(',')[0].trim()}</div>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}

// ====== MCP 服务 ======
export function McpSection({ delay = 0.6 }) {
  const [servers, setServers] = useState([])

  useEffect(() => {
    sbQuery('mcp_servers', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=10' })
      .then(data => setServers(data || []))
      .catch(err => console.error('[HomeModules] MCP服务加载失败:', err.message))
  }, [])

  if (servers.length === 0) return null

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="home-section-header">
        <Server size={20} className="home-section-icon home-section-icon--mcp" />
        <h2>MCP 服务</h2>
        <span className="home-section-subtitle">Model Context Protocol 工具集</span>
        <Link to="/mcp" className="home-section-view-all">
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="home-modules-grid">
        {servers.slice(0, 10).map((server, i) => (
          <Link
            key={server.id}
            to={`/mcp/${server.id}`}
            className="home-module-card home-module-card--mcp"
          >
            {server.is_recommended && <div className="home-module-card-recommended">推荐</div>}
            <div className="home-module-card-icon home-module-card-icon--mcp">
              {(() => { const BIcon = getBrandIcon(server.name); return BIcon ? <BIcon size={20} /> : <Server size={16} /> })()}
            </div>
            <div className="home-module-card-body">
              <div className="home-module-card-name">{server.name}</div>
              <div className="home-module-card-desc">{server.description}</div>
              <div className="home-module-card-tag">{server.category?.split(',')[0].trim()}</div>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}

// ====== Skills 技能 ======
export function SkillsSection({ delay = 0.65 }) {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    sbQuery('skills_data', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=10' })
      .then(data => setSkills(data || []))
      .catch(err => console.error('[HomeModules] Skills技能加载失败:', err.message))
  }, [])

  if (skills.length === 0) return null

  return (
    <motion.section
      className="home-section"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="home-section-header">
        <Wrench size={20} className="home-section-icon home-section-icon--skills" />
        <h2>Skills 技能</h2>
        <span className="home-section-subtitle">AI Agent 能力模块</span>
        <Link to="/skills" className="home-section-view-all">
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="home-modules-grid">
        {skills.slice(0, 10).map((skill, i) => (
          <Link
            key={skill.id}
            to={`/skills/${skill.id}`}
            className="home-module-card home-module-card--skill"
          >
            {skill.is_recommended && <div className="home-module-card-recommended">推荐</div>}
            <div className="home-module-card-icon home-module-card-icon--skill">
              <Wrench size={16} />
            </div>
            <div className="home-module-card-body">
              <div className="home-module-card-name">{skill.name}</div>
              <div className="home-module-card-desc">{skill.description}</div>
              <div className="home-module-card-tag">{skill.category}</div>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  )
}
