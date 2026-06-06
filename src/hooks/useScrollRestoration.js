import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 滚动位置恢复 Hook
 * @param {string} storageKey - sessionStorage 的 key，用于区分不同页面
 * @param {object} options
 * @param {string} options.scrollElementId - 可选，指定滚动容器的 id（默认使用 window）
 * @param {boolean} options.enabled - 是否启用（默认 true）
 */
export function useScrollRestoration(storageKey, { scrollElementId, enabled = true } = {}) {
  const location = useLocation()
  const isInitialMount = useRef(true)
  const prevPathname = useRef(location.pathname)

  // 页面挂载时恢复滚动位置
  useEffect(() => {
    if (!enabled) return

    // 只在初始挂载时恢复（不是路由变化时）
    if (isInitialMount.current) {
      isInitialMount.current = false

      const savedPosition = sessionStorage.getItem(`scroll_${storageKey}`)
      if (savedPosition) {
        const position = parseInt(savedPosition, 10)
        // 延迟一帧恢复，确保 DOM 已渲染
        requestAnimationFrame(() => {
          if (scrollElementId) {
            const el = document.getElementById(scrollElementId)
            if (el) el.scrollTop = position
          } else {
            window.scrollTo(0, position)
          }
        })
        // 恢复后清除，避免影响正常刷新
        sessionStorage.removeItem(`scroll_${storageKey}`)
      }
    }
  }, [enabled, storageKey, scrollElementId])

  // 页面卸载/路由变化时保存滚动位置
  useEffect(() => {
    if (!enabled) return

    return () => {
      let scrollPos = 0
      if (scrollElementId) {
        const el = document.getElementById(scrollElementId)
        if (el) scrollPos = el.scrollTop
      } else {
        scrollPos = window.scrollY
      }
      sessionStorage.setItem(`scroll_${storageKey}`, String(scrollPos))
    }
  }, [enabled, storageKey, scrollElementId, location.pathname])
}

/**
 * 路由变化时滚动到顶部 Hook
 * 用于详情页之间跳转时确保从顶部开始
 */
export function useScrollToTopOnRouteChange() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
}
