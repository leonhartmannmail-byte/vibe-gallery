import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, MessageSquare, Server, Wrench, ArrowRight, ExternalLink } from 'lucide-react'
import { sbQuery } from '../../lib/supabase'
import './HomeModules.css'

// ====== 导航网站推荐 ======
export function NavSitesSection({ delay = 0.5 }) {
  const [sites, setSites] = useState([])

  useEffect(() => {
    sbQuery('nav_sites', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=12' })
      .then(data => setSites(data || []))
      .catch(() => {})
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
      </div>
      <div className="home-section-scroll home-modules-scroll">
        {sites.map((site, i) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="home-module-card"
          >
            <div className="home-module-card-icon">
              {site.icon_url ? (
                <img src={site.icon_url} alt="" />
              ) : (
                <span>{site.name[0]}</span>
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
    sbQuery('ai_prompts', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=8' })
      .then(data => setPrompts(data || []))
      .catch(() => {})
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
      </div>
      <div className="home-section-scroll home-modules-scroll">
        {prompts.map((prompt, i) => (
          <div key={prompt.id} className="home-module-card home-module-card--prompt">
            <div className="home-module-card-body">
              <div className="home-module-card-name">{prompt.name}</div>
              <div className="home-module-card-desc">{prompt.description}</div>
              {prompt.content && (
                <div className="home-module-card-content">{prompt.content}</div>
              )}
              <div className="home-module-card-tag">{prompt.category}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

// ====== MCP 服务 ======
export function McpSection({ delay = 0.6 }) {
  const [servers, setServers] = useState([])

  useEffect(() => {
    sbQuery('mcp_servers', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=12' })
      .then(data => setServers(data || []))
      .catch(() => {})
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
      </div>
      <div className="home-section-scroll home-modules-scroll">
        {servers.map((server, i) => (
          <div key={server.id} className="home-module-card home-module-card--mcp">
            <div className="home-module-card-icon home-module-card-icon--mcp">
              <Server size={16} />
            </div>
            <div className="home-module-card-body">
              <div className="home-module-card-name">{server.name}</div>
              <div className="home-module-card-desc">{server.description}</div>
              <div className="home-module-card-tag">{server.category}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

// ====== Skills 技能 ======
export function SkillsSection({ delay = 0.65 }) {
  const [skills, setSkills] = useState([])

  useEffect(() => {
    sbQuery('skills_data', { params: '?select=*&is_active=eq.true&order=sort_order.asc&limit=12' })
      .then(data => setSkills(data || []))
      .catch(() => {})
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
      </div>
      <div className="home-section-scroll home-modules-scroll">
        {skills.map((skill, i) => (
          <div key={skill.id} className="home-module-card home-module-card--skill">
            <div className="home-module-card-icon home-module-card-icon--skill">
              <Wrench size={16} />
            </div>
            <div className="home-module-card-body">
              <div className="home-module-card-name">{skill.name}</div>
              <div className="home-module-card-desc">{skill.description}</div>
              <div className="home-module-card-tag">{skill.category}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
