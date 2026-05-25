import { useRef, useEffect, useCallback } from 'react'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function PixelBlast({
  variant = 'square',
  pixelSize = 3,
  color = '#B497CF',
  patternScale = 2,
  patternDensity = 1,
  enableRipples = true,
  rippleSpeed = 0.3,
  rippleThickness = 0.1,
  rippleIntensityScale = 1,
  speed = 0.5,
  transparent = false,
  edgeFade = 0.5,
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const ripplesRef = useRef([])
  const timeRef = useRef(0)
  const pixelsRef = useRef([])

  const initPixels = useCallback((width, height) => {
    const gap = pixelSize + 1
    const cols = Math.ceil(width / gap)
    const rows = Math.ceil(height / gap)
    const pixels = []
    const rgb = hexToRgb(color)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = col / cols
        const ny = row / rows
        const noise = Math.sin(nx * patternScale * 6 + ny * patternScale * 4) *
                      Math.cos(ny * patternScale * 5 - nx * patternScale * 3)
        const isActive = Math.abs(noise) < patternDensity * 0.4

        if (isActive) {
          pixels.push({
            x: col * gap,
            y: row * gap,
            baseAlpha: 0.15 + Math.random() * 0.35,
            phase: Math.random() * Math.PI * 2,
            freq: 0.3 + Math.random() * 0.7,
          })
        }
      }
    }
    return pixels
  }, [pixelSize, color, patternScale, patternDensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      pixelsRef.current = initPixels(w, h)
    }

    resize()
    const resizeObs = new ResizeObserver(resize)
    resizeObs.observe(parent)

    const ctx = canvas.getContext('2d')
    const rgb = hexToRgb(color)

    function addRipple(x, y) {
      ripplesRef.current.push({
        x, y,
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 0.6,
        birth: timeRef.current,
      })
      if (ripplesRef.current.length > 5) ripplesRef.current.shift()
    }

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) * dpr
      mouseRef.current.y = (e.clientY - rect.top) * dpr

      if (enableRipples && Math.random() < 0.03 * rippleSpeed) {
        addRipple(mouseRef.current.x, mouseRef.current.y)
      }
    }

    function handleClick(e) {
      if (!enableRipples) return
      const rect = canvas.getBoundingClientRect()
      addRipple((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    // Auto ripples
    const autoRipple = setInterval(() => {
      if (!enableRipples) return
      const w = canvas.width
      const h = canvas.height
      addRipple(
        w * 0.2 + Math.random() * w * 0.6,
        h * 0.2 + Math.random() * h * 0.6
      )
    }, 3000 / rippleSpeed)

    function draw(timestamp) {
      const dt = 0.016 * speed
      timeRef.current += dt
      const t = timeRef.current

      const w = canvas.width
      const h = canvas.height

      if (transparent) {
        ctx.clearRect(0, 0, w, h)
      } else {
        ctx.fillStyle = '#09090b'
        ctx.fillRect(0, 0, w, h)
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const mouseRadius = 150 * dpr

      // Draw pixels
      for (const p of pixelsRef.current) {
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const mouseInfluence = Math.max(0, 1 - dist / mouseRadius)

        // Ripple influence
        let rippleInfluence = 0
        for (const r of ripplesRef.current) {
          const rdx = p.x - r.x
          const rdy = p.y - r.y
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy)
          const rAge = t - r.birth
          const ringPos = Math.abs(rDist - r.radius)
          const ringWidth = r.maxRadius * rippleThickness
          if (ringPos < ringWidth && rAge < 3) {
            rippleInfluence = Math.max(rippleInfluence,
              (1 - ringPos / ringWidth) * rippleIntensityScale * Math.max(0, 1 - rAge / 3)
            )
          }
        }

        const breathe = Math.sin(t * p.freq + p.phase) * 0.15
        const alpha = Math.min(1, p.baseAlpha + breathe + mouseInfluence * 0.6 + rippleInfluence * 0.8)

        // Edge fade
        const ex = Math.min(p.x / (w * edgeFade), (w - p.x) / (w * edgeFade), 1)
        const ey = Math.min(p.y / (h * edgeFade), (h - p.y) / (h * edgeFade), 1)
        const edgeAlpha = Math.min(ex, ey)

        const finalAlpha = alpha * edgeAlpha
        if (finalAlpha < 0.01) continue

        const glow = mouseInfluence * 0.5 + rippleInfluence * 0.3
        const pr = Math.min(255, rgb.r + glow * 60)
        const pg = Math.min(255, rgb.g + glow * 40)
        const pb = Math.min(255, rgb.b + glow * 80)

        ctx.fillStyle = `rgba(${pr|0},${pg|0},${pb|0},${finalAlpha})`

        if (variant === 'circle') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, pixelSize * dpr * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(p.x, p.y, pixelSize * dpr, pixelSize * dpr)
        }
      }

      // Update ripples
      for (const r of ripplesRef.current) {
        r.radius += rippleSpeed * 8 * dpr * dt
      }
      ripplesRef.current = ripplesRef.current.filter(
        r => r.radius < r.maxRadius && (t - r.birth) < 4
      )

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      clearInterval(autoRipple)
      resizeObs.disconnect()
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [variant, pixelSize, color, patternScale, patternDensity, enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale, speed, transparent, edgeFade, initPixels])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    />
  )
}

export default PixelBlast
