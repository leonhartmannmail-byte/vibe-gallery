const STORAGE_KEY = 'vibe_work_metadata'
const MAX_ENTRIES = 500

export function getWorkMetadata(workId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[workId] || null
  } catch {
    return null
  }
}

export function setWorkMetadata(workId, data) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[workId] = { ...all[workId], ...data, updatedAt: Date.now() }

    // 防止 localStorage 膨胀，超过上限时删除最旧的
    const keys = Object.keys(all)
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys.sort((a, b) => (all[a].updatedAt || 0) - (all[b].updatedAt || 0))
      const toRemove = sorted.slice(0, keys.length - MAX_ENTRIES)
      toRemove.forEach(k => delete all[k])
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // localStorage 满或不可用时静默失败
  }
}

export function removeWorkMetadata(workId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    delete all[workId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // silent
  }
}
