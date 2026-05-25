import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import './ImageUploader.css'

function ImageUploader({ images = [], onChange, maxImages = 5, label = '上传图片' }) {
  const [previews, setPreviews] = useState(images)
  const fileRef = useRef(null)

  function handleSelect(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const remaining = maxImages - previews.length
    const selected = files.slice(0, remaining)

    const newPreviews = selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }))

    const updated = [...previews, ...newPreviews]
    setPreviews(updated)
    onChange(updated.map(p => p.file))

    // 清空 input 以便重复选择同一文件
    e.target.value = ''
  }

  function handleRemove(index) {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onChange(updated.map(p => p.file || p))
  }

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">{label}</label>

      <div className="image-uploader-grid">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview.url || preview}
              className="image-uploader-preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <img src={preview.url || preview} alt="" />
              <button
                type="button"
                className="image-uploader-remove"
                onClick={() => handleRemove(index)}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {previews.length < maxImages && (
          <motion.button
            type="button"
            className="image-uploader-add"
            onClick={() => fileRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={24} />
            <span>{label}</span>
            <span className="image-uploader-hint">
              {previews.length}/{maxImages}
            </span>
          </motion.button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUploader
