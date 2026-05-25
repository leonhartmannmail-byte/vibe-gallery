import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Link as LinkIcon, Tag, Image as ImageIcon, Palette, Zap, Settings, Smartphone, Monitor, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { PLATFORM_TYPES, AI_TOOLS, AI_MODELS } from '../config/enums'
import ImageUploader from '../components/ImageUploader/ImageUploader'
import DefaultCoverPicker from '../components/DefaultCoverPicker/DefaultCoverPicker'
import './Publish.css'

function Publish() {
  const { user } = useAuth()
  const { createWork, uploadImage } = useWorks()
  const { t, locale } = useLanguage()
  const navigate = useNavigate()

  const [publishMode, setPublishMode] = useState('quick')
  const [title, setTitle] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [coverMode, setCoverMode] = useState('upload')
  const [coverBg, setCoverBg] = useState(null)
  const [coverEmoji, setCoverEmoji] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 新字段
  const [platform, setPlatform] = useState('web')
  const [selectedTools, setSelectedTools] = useState([])
  const [selectedModels, setSelectedModels] = useState([])
  const [aiWorkflow, setAiWorkflow] = useState('')
  const [devTime, setDevTime] = useState('')

  if (!user) {
    return (
      <div className="publish-page">
        <div className="publish-no-auth">
          <p>{t('publish.noAuth')}</p>
          <button onClick={() => navigate('/auth')} className="publish-auth-btn">
            {t('publish.goToLogin')}
          </button>
        </div>
      </div>
    )
  }

  function handleAddTag(tag) {
    const t = tag.trim()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  function handleRemoveTag(tag) {
    setTags(tags.filter(t => t !== tag))
  }

  function toggleTool(value) {
    setSelectedTools(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  function toggleModel(value) {
    setSelectedModels(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (publishMode === 'quick') {
      if (!oneLiner.trim()) {
        setError(t('publish.titleRequired'))
        return
      }
    } else {
      if (!title.trim()) {
        setError(t('publish.titleRequired'))
        return
      }
    }

    const hasEmojiCover = coverMode === 'default' && coverBg && coverEmoji
    if (!coverFile && imageFiles.length === 0 && !hasEmojiCover) {
      setError(t('publish.imageRequired'))
      return
    }

    setLoading(true)

    try {
      const workId = crypto.randomUUID()
      let coverUrl = ''
      const imageUrls = []

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${workId}/cover.${ext}`
        const { url, error: uploadErr } = await uploadImage(coverFile, path)
        if (uploadErr) throw new Error(`${t('publish.coverUploadFailed')}: ${uploadErr.message || ''}`)
        coverUrl = url
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${workId}/image-${i}.${ext}`
        const { url, error: uploadErr } = await uploadImage(file, path)
        if (uploadErr) throw new Error(`${t('publish.imageUploadFailed', { i: i + 1 })}: ${uploadErr.message || ''}`)
        imageUrls.push(url)
      }

      if (!coverUrl && imageUrls.length > 0) {
        coverUrl = imageUrls[0]
      }

      const finalTitle = publishMode === 'quick' ? oneLiner.trim() : title.trim()
      const finalDesc = publishMode === 'quick'
        ? `A Vibe Coding project: ${oneLiner.trim()}`
        : description.trim()

      const { data, error: createErr } = await createWork({
        id: workId,
        title: finalTitle,
        description: finalDesc,
        one_liner: oneLiner.trim(),
        cover_url: hasEmojiCover ? 'emoji-cover' : coverUrl,
        cover_bg: hasEmojiCover ? coverBg : null,
        cover_emoji: hasEmojiCover ? coverEmoji : null,
        images: imageUrls,
        link: link.trim(),
        tags,
        platform,
        ai_tools: selectedTools,
        ai_models: selectedModels,
      })

      if (createErr) throw createErr
      navigate(`/work/${data?.id || workId}`)
    } catch (err) {
      setError(err.message || t('publish.publishFailed'))
    } finally {
      setLoading(false)
    }
  }

  const PlatformIcon = platform === 'mobile' ? Smartphone : Monitor

  return (
    <div className="publish-page">
      <motion.div
        className="publish-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="publish-title">
          <span className="gradient-text">{t('publish.title')}</span>
        </h1>
        <p className="publish-subtitle">{t('publish.subtitle')}</p>

        {error && (
          <motion.div className="publish-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        {/* 模式切换 */}
        <div className="publish-mode-toggle">
          <button type="button" className={`publish-mode-btn ${publishMode === 'quick' ? 'active' : ''}`} onClick={() => setPublishMode('quick')}>
            <Zap size={16} /> {t('publish.quickMode')}
          </button>
          <button type="button" className={`publish-mode-btn ${publishMode === 'advanced' ? 'active' : ''}`} onClick={() => setPublishMode('advanced')}>
            <Settings size={16} /> {t('publish.advancedMode')}
          </button>
        </div>

        <form className="publish-form" onSubmit={handleSubmit}>
          {/* 平台选择 - 两种模式都有 */}
          <div className="publish-field">
            <label>{t('publish.platform')}</label>
            <div className="publish-platform-select">
              {PLATFORM_TYPES.map(p => {
                const Icon = p.value === 'mobile' ? Smartphone : Monitor
                return (
                  <button
                    key={p.value}
                    type="button"
                    className={`publish-platform-btn ${platform === p.value ? 'active' : ''}`}
                    onClick={() => setPlatform(p.value)}
                  >
                    <Icon size={18} />
                    <span>{p.label[locale === 'en' ? 'en' : 'zh']}</span>
                    {platform === p.value && <Check size={14} className="publish-platform-check" />}
                  </button>
                )
              })}
            </div>
          </div>

          {publishMode === 'quick' ? (
            <>
              {/* 封面 */}
              <div className="publish-field">
                <label>{t('publish.coverMode')}</label>
                <div className="publish-cover-mode">
                  <button type="button" className={`publish-cover-mode-btn ${coverMode === 'upload' ? 'active' : ''}`} onClick={() => setCoverMode('upload')}>
                    <ImageIcon size={16} /> {t('publish.uploadImage')}
                  </button>
                  <button type="button" className={`publish-cover-mode-btn ${coverMode === 'default' ? 'active' : ''}`} onClick={() => setCoverMode('default')}>
                    <Palette size={16} /> {t('publish.defaultCover')}
                  </button>
                </div>
              </div>

              {coverMode === 'upload' ? (
                <ImageUploader images={[]} onChange={(files) => setCoverFile(files[0] || null)} maxImages={1} label={t('publish.uploadCover')} />
              ) : (
                <DefaultCoverPicker coverBg={coverBg} coverEmoji={coverEmoji} onCoverBgChange={setCoverBg} onCoverEmojiChange={setCoverEmoji} />
              )}

              <div className="publish-field">
                <label>{t('publish.oneLiner')}</label>
                <input type="text" placeholder={t('publish.oneLinerPlaceholder')} value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} />
              </div>

              <div className="publish-field">
                <label>{t('publish.externalLink')}</label>
                <div className="publish-input-with-icon">
                  <LinkIcon size={18} className="publish-input-icon" />
                  <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="publish-field">
                <label>{t('publish.workTitle')}</label>
                <input type="text" placeholder={t('publish.workTitlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="publish-field">
                <label>{t('publish.oneLiner')}</label>
                <input type="text" placeholder={t('publish.oneLinerPlaceholder')} value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} />
              </div>

              <div className="publish-field">
                <label>{t('publish.workDesc')}</label>
                <textarea placeholder={t('publish.workDescPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>

              <div className="publish-field">
                <label>{t('publish.externalLink')}</label>
                <div className="publish-input-with-icon">
                  <LinkIcon size={18} className="publish-input-icon" />
                  <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
              </div>

              <div className="publish-field">
                <label>{t('publish.coverMode')}</label>
                <div className="publish-cover-mode">
                  <button type="button" className={`publish-cover-mode-btn ${coverMode === 'upload' ? 'active' : ''}`} onClick={() => setCoverMode('upload')}>
                    <ImageIcon size={16} /> {t('publish.uploadImage')}
                  </button>
                  <button type="button" className={`publish-cover-mode-btn ${coverMode === 'default' ? 'active' : ''}`} onClick={() => setCoverMode('default')}>
                    <Palette size={16} /> {t('publish.defaultCover')}
                  </button>
                </div>
              </div>

              {coverMode === 'upload' ? (
                <ImageUploader images={[]} onChange={(files) => setCoverFile(files[0] || null)} maxImages={1} label={t('publish.uploadCover')} />
              ) : (
                <DefaultCoverPicker coverBg={coverBg} coverEmoji={coverEmoji} onCoverBgChange={setCoverBg} onCoverEmojiChange={setCoverEmoji} />
              )}

              <ImageUploader images={[]} onChange={setImageFiles} maxImages={5} label={t('publish.uploadScreenshots')} />

              <div className="publish-field">
                <label>{t('publish.tags')}</label>
                <div className="publish-tags">
                  {tags.map(tag => (
                    <span key={tag} className="publish-tag">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="publish-input-with-icon">
                  <Tag size={18} className="publish-input-icon" />
                  <input type="text" placeholder={t('publish.tagPlaceholder')} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                </div>
              </div>

              <div className="publish-field">
                <label>{t('publish.aiWorkflowLabel')}</label>
                <textarea placeholder={t('publish.aiWorkflowPlaceholder')} value={aiWorkflow} onChange={(e) => setAiWorkflow(e.target.value)} rows={3} />
              </div>

              <div className="publish-field">
                <label>{t('publish.devTime')}</label>
                <input type="text" placeholder={t('publish.devTimePlaceholder')} value={devTime} onChange={(e) => setDevTime(e.target.value)} />
              </div>
            </>
          )}

          {/* AI 开发工具 - 两种模式都有 */}
          <div className="publish-field">
            <label>{t('publish.aiTools')} <span className="publish-hint">{t('publish.aiToolsHint')}</span></label>
            <div className="publish-chips">
              {AI_TOOLS.map(tool => (
                <button
                  key={tool.value}
                  type="button"
                  className={`publish-chip ${selectedTools.includes(tool.value) ? 'active' : ''}`}
                  style={selectedTools.includes(tool.value) ? { borderColor: tool.color, color: tool.color, background: `${tool.color}15` } : {}}
                  onClick={() => toggleTool(tool.value)}
                >
                  {selectedTools.includes(tool.value) && <Check size={12} />}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* 底层模型 - 两种模式都有 */}
          <div className="publish-field">
            <label>{t('publish.aiModels')} <span className="publish-hint">{t('publish.aiModelsHint')}</span></label>
            <div className="publish-chips">
              {AI_MODELS.map(model => (
                <button
                  key={model.value}
                  type="button"
                  className={`publish-chip ${selectedModels.includes(model.value) ? 'active' : ''}`}
                  style={selectedModels.includes(model.value) ? { borderColor: model.color, color: model.color, background: `${model.color}15` } : {}}
                  onClick={() => toggleModel(model.value)}
                >
                  {selectedModels.includes(model.value) && <Check size={12} />}
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button type="submit" className="publish-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? t('publish.publishing') : t('publish.publishBtn')}
            {!loading && <Send size={18} />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default Publish
