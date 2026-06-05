import { useNavigate } from 'react-router-dom'
import { Smartphone, Monitor, Cpu } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { getToolIcon } from '../../utils/lobeIcons'
import './FilterBar.css'

const PLATFORM_FILTERS = [
  { value: 'mobile', icon: Smartphone, label: { zh: 'Mobile', en: 'Mobile' } },
  { value: 'web', icon: Monitor, label: { zh: 'Web', en: 'Web' } },
]

const TOOL_FILTERS = [
  { value: 'Cursor' },
  { value: 'Claude Code' },
  { value: 'Codex' },
  { value: 'Windsurf' },
  { value: 'Aider', fallbackIcon: Cpu },
]

function FilterBar() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const lang = locale === 'en' ? 'en' : 'zh'

  function goExplore(params) {
    const qs = new URLSearchParams(params).toString()
    navigate(`/explore?${qs}`)
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar-group">
        <span className="filter-bar-label">{t('home.filterPlatform')}</span>
        <div className="filter-bar-pills">
          {PLATFORM_FILTERS.map(p => (
            <button
              key={p.value}
              className="filter-bar-pill"
              onClick={() => goExplore({ platform: p.value })}
            >
              <p.icon size={14} />
              <span>{p.label[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar-divider" />

      <div className="filter-bar-group">
        <span className="filter-bar-label">{t('home.filterTool')}</span>
        <div className="filter-bar-pills">
          {TOOL_FILTERS.map(tool => {
            const LobeIcon = getToolIcon(tool.value)
            const IconComp = LobeIcon || tool.fallbackIcon
            return (
              <button
                key={tool.value}
                className="filter-bar-pill"
                onClick={() => goExplore({ tool: tool.value })}
              >
                {IconComp && <IconComp size={14} />}
                <span>{tool.value}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FilterBar
