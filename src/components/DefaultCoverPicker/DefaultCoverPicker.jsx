import { X } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import './DefaultCoverPicker.css'

const backgrounds = [
  { id: 'purple', style: '#7c3aed' },
  { id: 'blue', style: '#2563eb' },
  { id: 'green', style: '#059669' },
  { id: 'red', style: '#dc2626' },
  { id: 'amber', style: '#d97706' },
  { id: 'pink', style: '#ec4899' },
  { id: 'cyan', style: '#06b6d4' },
  { id: 'indigo', style: '#6366f1' },
  { id: 'grad-purple', style: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { id: 'grad-ocean', style: 'linear-gradient(135deg, #2563eb, #06b6d4)' },
  { id: 'grad-forest', style: 'linear-gradient(135deg, #059669, #34d399)' },
  { id: 'grad-sunset', style: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { id: 'grad-aurora', style: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 'grad-sky', style: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' },
  { id: 'grad-fire', style: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 'grad-teal', style: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
]

const emojis = ['🧠', '💻', '🌱', '📷', '🎨', '🚀', '⚡', '🎮', '🎵', '📱', '🤖', '🔥', '💡', '🎯', '🛠️', '✨', '🌍', '📚', '🎭', '🦋']

function DefaultCoverPicker({ coverBg, coverEmoji, onCoverBgChange, onCoverEmojiChange }) {
  const { t } = useLanguage()
  return (
    <div className="cover-picker">
      <div className="cover-picker-section">
        <span className="cover-picker-label">{t('coverPicker.background')}</span>
        <div className="cover-picker-bg-grid">
          {backgrounds.map(bg => (
            <button
              key={bg.id}
              type="button"
              className={`cover-picker-bg-swatch ${coverBg === bg.style ? 'selected' : ''}`}
              style={{ background: bg.style }}
              onClick={() => onCoverBgChange(coverBg === bg.style ? null : bg.style)}
            />
          ))}
          <button
            type="button"
            className="cover-picker-bg-swatch cover-picker-bg-none"
            onClick={() => onCoverBgChange(null)}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="cover-picker-section">
        <span className="cover-picker-label">{t('coverPicker.icon')}</span>
        <div className="cover-picker-emoji-grid">
          {emojis.map(emoji => (
            <button
              key={emoji}
              type="button"
              className={`cover-picker-emoji-btn ${coverEmoji === emoji ? 'selected' : ''}`}
              onClick={() => onCoverEmojiChange(coverEmoji === emoji ? null : emoji)}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            className="cover-picker-emoji-btn cover-picker-emoji-none"
            onClick={() => onCoverEmojiChange(null)}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {(coverBg || coverEmoji) && (
        <div className="cover-picker-section">
          <span className="cover-picker-label">{t('coverPicker.preview')}</span>
          <div className="cover-picker-preview" style={{ background: coverBg || 'var(--bg-surface)' }}>
            {coverEmoji && <span className="cover-picker-preview-emoji">{coverEmoji}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default DefaultCoverPicker
