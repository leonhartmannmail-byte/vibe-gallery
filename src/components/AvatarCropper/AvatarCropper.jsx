import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Check, ZoomIn } from 'lucide-react'
import './AvatarCropper.css'

const OUTPUT_SIZE = 400

function AvatarCropper({ file, onConfirm, onCancel, t }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageNatural, setImageNatural] = useState({ w: 0, h: 0 })
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const previewSquareRef = useRef(null)
  const previewCircleRef = useRef(null)

  const CROP_SIZE = 240 // crop circle diameter in px

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Update preview canvases when crop changes
  useEffect(() => {
    if (!imgRef.current || !imageNatural.w) return
    const cx = (CROP_SIZE / 2 - offset.x) / zoom
    const cy = (CROP_SIZE / 2 - offset.y) / zoom
    const srcSize = CROP_SIZE / zoom
    const sx = cx - srcSize / 2
    const sy = cy - srcSize / 2
    const size = 80

    for (const canvas of [previewSquareRef.current, previewCircleRef.current]) {
      if (!canvas) continue
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(imgRef.current, sx, sy, srcSize, srcSize, 0, 0, size, size)
    }
  }, [zoom, offset, imageNatural])

  const handleImageLoad = useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.target
    setImageNatural({ w: naturalWidth, h: naturalHeight })
    // Scale so the smaller edge fills the crop circle
    const scale = CROP_SIZE / Math.min(naturalWidth, naturalHeight)
    setZoom(scale)
    // Center the image in the viewport
    const x = (CROP_SIZE - naturalWidth * scale) / 2
    const y = (CROP_SIZE - naturalHeight * scale) / 2
    setOffset({ x, y })
  }, [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [dragging, dragStart])

  const handleMouseUp = () => setDragging(false)

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setDragging(true)
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y })
  }

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return
    const touch = e.touches[0]
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }, [dragging, dragStart])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [dragging, handleMouseMove, handleTouchMove])

  const handleConfirm = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')

    // The crop area center in image source coordinates
    const cx = (CROP_SIZE / 2 - offset.x) / zoom
    const cy = (CROP_SIZE / 2 - offset.y) / zoom

    // Source square size
    const srcSize = CROP_SIZE / zoom
    const sx = cx - srcSize / 2
    const sy = cy - srcSize / 2

    // Draw square crop (no circular clip — avoids jagged edges)
    ctx.drawImage(
      imgRef.current,
      sx, sy, srcSize, srcSize,
      0, 0, OUTPUT_SIZE, OUTPUT_SIZE
    )

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob)
    }, 'image/jpeg', 0.92)
  }

  if (!imageUrl) return null

  const imgStyle = {
    width: imageNatural.w * zoom,
    height: imageNatural.h * zoom,
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    cursor: dragging ? 'grabbing' : 'grab',
  }

  return (
    <div className="avatar-cropper-backdrop">
      <div className="avatar-cropper">
        <div className="avatar-cropper-header">
          <h3>{t('profile.cropTitle')}</h3>
          <button className="avatar-cropper-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="avatar-cropper-body">
          <div
            className="avatar-cropper-viewport"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="avatar-cropper-circle" />
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              onLoad={handleImageLoad}
              style={imgStyle}
              draggable={false}
            />
          </div>

          <div className="avatar-cropper-zoom">
            <ZoomIn size={14} />
            <input
              type="range"
              min={CROP_SIZE / Math.max(imageNatural.w, imageNatural.h)}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => {
                const newZoom = parseFloat(e.target.value)
                const imgCenterX = (CROP_SIZE / 2 - offset.x) / zoom
                const imgCenterY = (CROP_SIZE / 2 - offset.y) / zoom
                setOffset({
                  x: CROP_SIZE / 2 - imgCenterX * newZoom,
                  y: CROP_SIZE / 2 - imgCenterY * newZoom,
                })
                setZoom(newZoom)
              }}
            />
          </div>

          <div className="avatar-cropper-preview-row">
            <div className="avatar-cropper-preview-item">
              <canvas ref={previewSquareRef} className="avatar-cropper-preview-canvas" />
              <span>{t('profile.cropPreviewSquare')}</span>
            </div>
            <div className="avatar-cropper-preview-item">
              <canvas ref={previewCircleRef} className="avatar-cropper-preview-canvas avatar-cropper-preview-canvas--circle" />
              <span>{t('profile.cropPreviewCircle')}</span>
            </div>
          </div>
        </div>

        <div className="avatar-cropper-actions">
          <button className="avatar-cropper-cancel" onClick={onCancel}>
            {t('profile.cropCancel')}
          </button>
          <button className="avatar-cropper-confirm" onClick={handleConfirm}>
            <Check size={16} />
            {t('profile.cropConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvatarCropper
