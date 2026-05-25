import { useEffect, useRef } from 'react'
import { useTheme } from '../../hooks/useTheme'
import './GridBackground.css'

function GridBackground() {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let squares = []
    let mouseX = -1000
    let mouseY = -1000

    const isDark = theme === 'dark'
    const strokeBase = isDark ? [255, 255, 255] : [0, 0, 0]
    const fillBase = isDark ? [255, 255, 255] : [0, 0, 0]
    const strokeAlpha = isDark ? 0.4 : 0.12
    const fillAlpha = isDark ? 0.05 : 0.03
    const idleMin = isDark ? 0.03 : 0.04
    const idleAmp = isDark ? 0.02 : 0.015
    const highlightBoost = isDark ? 0 : 0.06

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initSquares()
    }

    function initSquares() {
      squares = []
      const size = 60
      const cols = Math.ceil(canvas.width / size) + 1
      const rows = Math.ceil(canvas.height / size) + 1

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          squares.push({
            x: i * size,
            y: j * size,
            size: size - 2,
            opacity: 0,
            targetOpacity: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.5
          })
        }
      }
    }

    function handleMouseMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function animate(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      squares.forEach(sq => {
        const dx = mouseX - (sq.x + sq.size / 2)
        const dy = mouseY - (sq.y + sq.size / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 200

        if (dist < maxDist) {
          sq.targetOpacity = 1 - dist / maxDist
        } else {
          sq.targetOpacity = idleMin + Math.sin(time * 0.001 * sq.speed + sq.phase) * idleAmp
        }

        sq.opacity += (sq.targetOpacity - sq.opacity) * 0.08

        if (sq.opacity > 0.01) {
          const sa = sq.opacity * strokeAlpha + highlightBoost * sq.opacity
          ctx.strokeStyle = `rgba(${strokeBase[0]}, ${strokeBase[1]}, ${strokeBase[2]}, ${sa})`
          ctx.lineWidth = 1
          ctx.strokeRect(sq.x, sq.y, sq.size, sq.size)

          if (sq.opacity > 0.1) {
            ctx.fillStyle = `rgba(${fillBase[0]}, ${fillBase[1]}, ${fillBase[2]}, ${sq.opacity * fillAlpha})`
            ctx.fillRect(sq.x, sq.y, sq.size, sq.size)
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [theme])

  return (
    <div className="grid-background">
      <canvas ref={canvasRef} className="grid-background-canvas" />
    </div>
  )
}

export default GridBackground
