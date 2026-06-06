import { useState, useCallback } from 'react'
import { sbQuery } from '../lib/supabase'

// 从 localStorage 读取当前用户
function getLocalUser() {
  try {
    const raw = localStorage.getItem(import.meta.env.VITE_SUPABASE_URL + '-auth-token')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession || parsed
    return session?.user || null
  } catch {
    return null
  }
}

export function useWorks() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 12

  // 超时包装器
  function withTimeout(promise, ms = 15000) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`请求超时 (${ms / 1000}s)`)), ms)
      )
    ])
  }

  // 获取作者信息
  async function fetchProfiles(userIds) {
    if (!userIds.length) return {}
    const ids = userIds.join(',')
    const data = await sbQuery('profiles', {
      params: `?select=id,username,avatar_url&id=in.(${ids})`
    })
    const map = {}
    data?.forEach(p => { map[p.id] = p })
    return map
  }

  // 获取作品列表（用直接 fetch）
  const fetchWorks = useCallback(async ({ page = 0, sort = 'latest', tag = null, userId = null, platform = null } = {}) => {
    setLoading(true)
    try {
      let params = '?select=*&limit=12'
      const from = page * pageSize
      const to = from + pageSize - 1

      if (sort === 'popular') {
        params += '&order=likes_count.desc'
      } else {
        params += '&order=created_at.desc'
      }

      if (tag) {
        params += `&tags=cs.{${tag}}`
      }

      if (userId) {
        params += `&user_id=eq.${userId}`
      }

      if (platform) {
        params += `&platform=eq.${platform}`
      }

      params += `&offset=${from}&limit=${pageSize}`

      const data = await sbQuery('works', { params })

      const userIds = [...new Set((data || []).map(w => w.user_id))]
      const profilesMap = await fetchProfiles(userIds)

      const worksWithProfiles = (data || []).map(w => ({
        ...w,
        profiles: profilesMap[w.user_id] || null
      }))

      if (page === 0) {
        setWorks(worksWithProfiles)
      } else {
        setWorks(prev => [...prev, ...worksWithProfiles])
      }

      setHasMore((data || []).length === pageSize)
      return worksWithProfiles
    } catch (error) {
      console.error('[useWorks] 获取作品失败:', error)
      if (page === 0) setWorks([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取单个作品详情（用直接 fetch）
  const fetchWork = useCallback(async (workId) => {
    try {
      const works = await sbQuery('works', {
        params: `?select=*&id=eq.${workId}`
      })
      const work = works?.[0]
      if (!work) return null

      const profiles = await sbQuery('profiles', {
        params: `?select=id,username,avatar_url,bio&id=eq.${work.user_id}`
      })

      return { ...work, profiles: profiles?.[0] || null }
    } catch (error) {
      console.error('获取作品详情失败:', error)
      return null
    }
  }, [])

  // 发布作品（用直接 fetch）
  const createWork = useCallback(async (workData) => {
    try {
      const user = getLocalUser()
      if (!user) throw new Error('未登录')

      const id = workData.id
      const data = await sbQuery('works', {
        method: 'POST',
        body: { ...workData, user_id: user.id }
      })

      return { data: data?.[0] || { id }, error: null }
    } catch (error) {
      console.error('发布作品失败:', error)
      return { data: null, error }
    }
  }, [])

  // 更新作品（用直接 fetch）
  const updateWork = useCallback(async (workId, updates) => {
    try {
      const user = getLocalUser()
      if (!user) throw new Error('未登录')

      const data = await sbQuery('works', {
        method: 'PATCH',
        params: `?select=*&id=eq.${workId}&user_id=eq.${user.id}`,
        body: updates
      })

      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('更新作品失败:', error)
      return { data: null, error }
    }
  }, [])

  // 删除作品
  const deleteWork = useCallback(async (workId) => {
    try {
      const user = getLocalUser()
      if (!user) throw new Error('未登录')

      await sbQuery('works', {
        method: 'DELETE',
        params: `?id=eq.${workId}&user_id=eq.${user.id}`
      })

      return { error: null }
    } catch (error) {
      console.error('删除作品失败:', error)
      return { error }
    }
  }, [])

  // 点赞/取消点赞
  const toggleLike = useCallback(async (workId) => {
    try {
      const user = getLocalUser()
      if (!user) throw new Error('未登录')

      const existingLikes = await sbQuery('likes', {
        params: `?select=id&user_id=eq.${user.id}&work_id=eq.${workId}`
      })

      const existingLike = existingLikes?.[0]

      if (existingLike) {
        await sbQuery('likes', {
          method: 'DELETE',
          params: `?id=eq.${existingLike.id}`
        })
      } else {
        await sbQuery('likes', {
          method: 'POST',
          body: { user_id: user.id, work_id: workId }
        })
      }

      // 查询最新点赞数（trigger 已更新）
      const workData = await sbQuery('works', {
        params: `?select=likes_count&id=eq.${workId}`
      })
      const newCount = workData?.[0]?.likes_count ?? 0

      return { liked: !existingLike, count: newCount }
    } catch (error) {
      console.error('点赞操作失败:', error)
      return { error }
    }
  }, [])

  // 检查是否已点赞
  const checkLiked = useCallback(async (workId) => {
    try {
      const user = getLocalUser()
      if (!user) return false

      const data = await sbQuery('likes', {
        params: `?select=id&user_id=eq.${user.id}&work_id=eq.${workId}`
      })

      return (data || []).length > 0
    } catch {
      return false
    }
  }, [])

  // 获取评论
  const fetchComments = useCallback(async (workId) => {
    try {
      const comments = await sbQuery('comments', {
        params: `?select=*&work_id=eq.${workId}&order=created_at.asc`
      })

      const userIds = [...new Set((comments || []).map(c => c.user_id))]
      const profilesMap = await fetchProfiles(userIds)

      return (comments || []).map(c => ({
        ...c,
        profiles: profilesMap[c.user_id] || null
      }))
    } catch (error) {
      console.error('获取评论失败:', error)
      return []
    }
  }, [])

  // 发表评论
  const addComment = useCallback(async (workId, content) => {
    try {
      const user = getLocalUser()
      if (!user) throw new Error('未登录')

      const comments = await sbQuery('comments', {
        method: 'POST',
        params: '?select=*',
        body: { user_id: user.id, work_id: workId, content }
      })
      const comment = comments?.[0]

      const profiles = await sbQuery('profiles', {
        params: `?select=id,username,avatar_url&id=eq.${user.id}`
      })

      return { data: { ...comment, profiles: profiles?.[0] || null }, error: null }
    } catch (error) {
      console.error('发表评论失败:', error)
      return { data: null, error }
    }
  }, [])

  // 上传图片（用 FormData + 直接 fetch）
  const uploadImage = useCallback(async (file, path) => {
    try {
      const token = getLocalUser() ? (() => {
        try {
          const raw = localStorage.getItem(import.meta.env.VITE_SUPABASE_URL + '-auth-token')
          const parsed = JSON.parse(raw)
          const session = parsed?.currentSession || parsed
          return session?.access_token
        } catch { return null }
      })() : null

      const formData = new FormData()
      formData.append('file', file)

      const res = await withTimeout(
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/works/${path}`, {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData
        })
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `上传失败 (${res.status})`)
      }

      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/works/${path}`
      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('上传图片失败:', error)
      return { url: null, error }
    }
  }, [])

  // 按 ID 批量查询作品
  const fetchWorksByIds = useCallback(async (ids) => {
    if (!ids.length) return []
    try {
      const data = await sbQuery('works', {
        params: `?select=*&id=in.(${ids.join(',')})`
      })
      const userIds = [...new Set((data || []).map(w => w.user_id))]
      const profilesMap = await fetchProfiles(userIds)
      return (data || []).map(w => ({ ...w, profiles: profilesMap[w.user_id] || null }))
    } catch (error) {
      console.error('获取指定作品失败:', error)
      return []
    }
  }, [])

  // 按平台查询作品（不影响共享状态）
  const fetchWorksByPlatform = useCallback(async ({ platform, limit = 8, sort = 'latest' } = {}) => {
    try {
      let params = `?select=*&platform=eq.${platform}&limit=${limit}`
      if (sort === 'popular') {
        params += '&order=likes_count.desc'
      } else {
        params += '&order=created_at.desc'
      }
      const data = await sbQuery('works', { params })
      const userIds = [...new Set((data || []).map(w => w.user_id))]
      const profilesMap = await fetchProfiles(userIds)
      return (data || []).map(w => ({ ...w, profiles: profilesMap[w.user_id] || null }))
    } catch (error) {
      console.error('获取平台作品失败:', error)
      return []
    }
  }, [])

  // 查询相关作品（相似标签 + 作者更多作品）
  const fetchRelatedWorks = useCallback(async ({ tags = [], authorId, excludeId } = {}) => {
    try {
      const results = { similar: [], fromAuthor: [] }

      // 按标签查相似作品
      if (tags.length > 0) {
        const tag = tags[0]
        const data = await sbQuery('works', {
          params: `?select=*&tags=cs.{${tag}}&id=neq.${excludeId || ''}&limit=8&order=likes_count.desc`
        })
        const userIds = [...new Set((data || []).map(w => w.user_id))]
        const profilesMap = await fetchProfiles(userIds)
        results.similar = (data || []).map(w => ({ ...w, profiles: profilesMap[w.user_id] || null }))
      }

      // 查作者更多作品
      if (authorId) {
        const data = await sbQuery('works', {
          params: `?select=*&user_id=eq.${authorId}&id=neq.${excludeId || ''}&limit=8&order=created_at.desc`
        })
        const userIds = [...new Set((data || []).map(w => w.user_id))]
        const profilesMap = await fetchProfiles(userIds)
        results.fromAuthor = (data || []).map(w => ({ ...w, profiles: profilesMap[w.user_id] || null }))
      }

      return results
    } catch (error) {
      console.error('获取相关作品失败:', error)
      return { similar: [], fromAuthor: [] }
    }
  }, [])

  return {
    works,
    loading,
    hasMore,
    fetchWorks,
    fetchWork,
    fetchWorksByIds,
    fetchWorksByPlatform,
    fetchRelatedWorks,
    createWork,
    updateWork,
    deleteWork,
    toggleLike,
    checkLiked,
    fetchComments,
    addComment,
    uploadImage
  }
}
