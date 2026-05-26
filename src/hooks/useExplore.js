import { useState, useCallback, useRef } from 'react'
import { sbQuery } from '../lib/supabase'

const PAGE_SIZE = 24

export function useExplore() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const abortRef = useRef(null)

  const fetchExplore = useCallback(async ({ page = 0, sort = 'latest', category = null, platform = null, tool = null, search = '' } = {}) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      let params = '?select=*&order='
      params += sort === 'popular' ? 'likes_count.desc' : 'created_at.desc'

      const filters = []
      if (category) filters.push(`category=eq.${category}`)
      if (platform) filters.push(`platform=eq.${platform}`)
      if (tool) filters.push(`ai_tools=cs.{${tool}}`)
      if (search.trim()) {
        const term = encodeURIComponent(search.trim())
        filters.push(`or=(title.ilike.*${term}*,description.ilike.*${term}*,one_liner.ilike.*${term}*)`)
      }

      const from = page * PAGE_SIZE
      const filterStr = filters.length ? '&' + filters.join('&') : ''
      params += `${filterStr}&offset=${from}&limit=${PAGE_SIZE}`

      const data = await sbQuery('works', { params })

      const userIds = [...new Set((data || []).map(w => w.user_id))]
      let profileMap = {}
      if (userIds.length) {
        const profiles = await sbQuery('profiles', {
          params: `?select=id,username,avatar_url&id=in.(${userIds.join(',')})`
        })
        profiles?.forEach(p => { profileMap[p.id] = p })
      }

      const enriched = (data || []).map(w => ({
        ...w,
        profiles: profileMap[w.user_id] || null
      }))

      if (page === 0) {
        setWorks(enriched)
      } else {
        setWorks(prev => [...prev, ...enriched])
      }

      setHasMore((data || []).length === PAGE_SIZE)
      return enriched
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useExplore] Fetch failed:', err)
        if (page === 0) setWorks([])
      }
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setWorks([])
    setHasMore(true)
  }, [])

  return { works, loading, hasMore, fetchExplore, reset }
}
