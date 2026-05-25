import { FEATURED_WORK_IDS, EDITOR_PICKS_IDS } from '../config/featured'

const BADGE_PRIORITY = ['featured', 'editor', 'popular', 'new', 'trending']

export function getWorkBadge(work) {
  const { id, likes_count = 0, created_at } = work
  const age = Date.now() - new Date(created_at).getTime()
  const hoursOld = age / (1000 * 60 * 60)

  if (FEATURED_WORK_IDS.includes(id)) {
    return { type: 'featured', icon: 'Star' }
  }
  if (EDITOR_PICKS_IDS.includes(id)) {
    return { type: 'editor', icon: 'Award' }
  }
  if (likes_count >= 10) {
    return { type: 'popular', icon: 'TrendingUp' }
  }
  if (hoursOld < 48) {
    return { type: 'new', icon: 'Sparkles' }
  }
  if (likes_count >= 3) {
    return { type: 'trending', icon: 'Flame' }
  }

  return null
}

export function formatCount(n) {
  if (n === 0 || n == null) return null
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function getTimeAgo(dateStr, locale = 'zh') {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (locale === 'zh') {
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 30) return `${days} 天前`
    return new Date(dateStr).toLocaleDateString('zh-CN')
  } else {
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US')
  }
}
