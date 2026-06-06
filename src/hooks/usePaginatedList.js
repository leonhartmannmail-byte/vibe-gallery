import { useState, useEffect, useCallback, useRef } from 'react'
import { sbQueryPage } from '../lib/supabase'

const PAGE_SIZE = 50

/**
 * 通用分页列表 Hook — 服务端筛选 + 按需加载
 */
export function usePaginatedList(table, {
  search = '',
  category = 'all',
  transform = null,
  categoryField = 'category',
} = {}) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [categories, setCategories] = useState([])
  const offsetRef = useRef(0)
  const abortRef = useRef(null)

  // 构建查询参数（服务端过滤）
  const buildParams = useCallback(() => {
    const parts = ['select=*', 'is_active=eq.true', 'order=sort_order.asc']

    // 分类筛选：匹配 "分类" 或 "分类,xxx"
    if (category && category !== 'all') {
      const enc = encodeURIComponent(category)
      const exact = `category.eq.%22${enc}%22`
      const prefix = `category.like.%22${enc},%25%22`
      parts.push(`or=(${exact},${prefix})`)
    }

    // 搜索：name + description
    if (search) {
      const s = encodeURIComponent(search)
      parts.push(`or=(name.ilike.*${s}*,description.ilike.*${s}*)`)
    }

    return `?${parts.join('&')}`
  }, [search, category])

  // 初始加载 / 筛选变化时重置
  useEffect(() => {
    if (abortRef.current) abortRef.current = true
    const aborted = { current: false }
    abortRef.current = aborted

    setLoading(true)
    setHasMore(false)
    offsetRef.current = 0

    const params = buildParams()

    sbQueryPage(table, { params, offset: 0, limit: PAGE_SIZE })
      .then(({ data, total: totalCount }) => {
        if (aborted.current) return
        const list = transform ? data.map(transform) : data
        setItems(list)
        setTotal(totalCount)
        setHasMore(list.length < totalCount)
        offsetRef.current = list.length
      })
      .catch(() => {
        if (!aborted.current) {
          setItems([])
          setTotal(0)
          setHasMore(false)
        }
      })
      .finally(() => {
        if (!aborted.current) setLoading(false)
      })

    return () => { aborted.current = true }
  }, [table, buildParams, transform])

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    try {
      const params = buildParams()
      const { data } = await sbQueryPage(table, { params, offset: offsetRef.current, limit: PAGE_SIZE })
      const list = transform ? data.map(transform) : data
      setItems(prev => [...prev, ...list])
      offsetRef.current += list.length
      setHasMore(offsetRef.current < total)
    } catch {
      // 保持当前状态
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, buildParams, table, transform, total])

  // 加载分类列表（仅首次）
  useEffect(() => {
    sbQueryPage(table, {
      params: `?select=${categoryField}&is_active=eq.true`,
      offset: 0,
      limit: 10000,
    })
      .then(({ data }) => {
        const cats = [...new Set(
          (data || [])
            .map(i => i[categoryField])
            .filter(Boolean)
            .map(c => c.split(',')[0].trim())
        )]
        setCategories(cats)
      })
      .catch(() => {})
  }, [table, categoryField])

  return { items, total, loading, loadingMore, hasMore, loadMore, categories }
}
