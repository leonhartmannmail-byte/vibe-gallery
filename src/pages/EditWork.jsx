import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Link as LinkIcon, Tag, Image as ImageIcon, Palette, Smartphone, Monitor, Check, Eye, Rocket, FlaskConical } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import { getWorkMetadata, setWorkMetadata } from '../utils/workMetadata'
import { PLATFORM_TYPES, AI_TOOLS, AI_MODELS, CONTENT_CATEGORIES } from '../config/enums'
import ImageUploader from '../components/ImageUploader/ImageUploader'
import DefaultCoverPicker from '../components/DefaultCoverPicker/DefaultCoverPicker'
import './EditWork.css'

const suggestedTags = ['React', 'AI', '动画', '游戏', '全栈', '工具', 'UI', '数据', 'Vue', 'Python']

function EditWork() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchWork, updateWork, uploadImage } = useWorks()
  const { t, locale } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [work, setWork] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [coverMode, setCoverMode] = useState('upload')
  const [coverBg, setCoverBg] = useState(null)
  const [coverEmoji, setCoverEmoji] = useState(null)
  const [existingCoverUrl, setExistingCoverUrl] = useState('')
  const [existingImages, setExistingImages] = useState([])

  // 元数据字段
  const [toolsInput, setToolsInput] = useState('')
  const [aiWorkflow, setAiWorkflow] = useState('')
  const [devTime, setDevTime] = useState('')

  // 新字段
  const [platform, setPlatform] = useState('web')
  const [category, setCategory] = useState('showcase')
  const [selectedTools, setSelectedTools] = useState([])
  const [selectedModels, setSelectedModels] = useState([])

  useEffect(() => {
    async function load() {
      if (!id || !user) return
      const data = await fetchWork(id)
      if (!data) {
        setLoading(false)
        return
      }
      if (data.user_id !== user.id) {
        navigate('/')
        return
      }
      setWork(data)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setLink(data.link || '')
      setTags(data.tags || [])
      setExistingCoverUrl(data.cover_url || '')
      setExistingImages(data.images || [])
      setPlatform(data.platform || 'web')
      setCategory(data.category || 'showcase')
      setSelectedTools(data.ai_tools || [])
      setSelectedModels(data.ai_models || [])

      if (data.cover_bg && data.cover_emoji) {
        setCoverMode('default')
        setCoverBg(data.cover_bg)
        setCoverEmoji(data.cover_emoji)
      } else {
        setCoverMode('upload')
      }

      // 加载元数据
      const meta = getWorkMetadata(id)
      if (meta) {
        setToolsInput(meta.tools?.join(', ') || '')
        setAiWorkflow(meta.aiWorkflow || '')
        setDevTime(meta.devTime || '')
      }

      setLoading(false)
    }
    load()
  }, [id, user])

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

    if (!title.trim()) {
      setError(t('editWork.titleRequired'))
      return
    }
    const hasEmojiCover = coverMode === 'default' && coverBg && coverEmoji
    if (!coverFile && imageFiles.length === 0 && !existingCoverUrl && !existingImages.length && !hasEmojiCover) {
      setError(t('editWork.imageRequired'))
      return
    }

    setSaving(true)
    try {
      let coverUrl = existingCoverUrl
      const imageUrls = [...existingImages]

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${user.id}/${id}/cover.${ext}`
        const { url, error: uploadErr } = await uploadImage(coverFile, path)
        if (uploadErr) throw new Error(`${t('editWork.coverUploadFailed')}: ${uploadErr.message}`)
        coverUrl = url
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${id}/image-${existingImages.length + i}.${ext}`
        const { url, error: uploadErr } = await uploadImage(file, path)
        if (uploadErr) throw new Error(`${t('editWork.imageUploadFailed')}: ${uploadErr.message}`)
        imageUrls.push(url)
      }

      const { error: updateErr } = await updateWork(id, {
        title: title.trim(),
        description: description.trim(),
        cover_url: hasEmojiCover ? 'emoji-cover' : coverUrl,
        cover_bg: hasEmojiCover ? coverBg : null,
        cover_emoji: hasEmojiCover ? coverEmoji : null,
        images: imageUrls,
        link: link.trim(),
        tags,
        platform,
        ai_tools: selectedTools,
        ai_models: selectedModels,
        category,
      })
      if (updateErr) throw updateErr

      // 保存元数据
      setWorkMetadata(id, {
        tools: toolsInput ? toolsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        aiWorkflow: aiWorkflow.trim(),
        devTime: devTime.trim(),
        techStack: tags,
      })

      navigate(`/work/${id}`)
    } catch (err) {
      setError(err.message || t('editWork.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-work-page">
        <div className="edit-work-loading">
          <div className="skeleton" style={{ height: 32, width: '40%' }} />
          <div className="skeleton" style={{ height: 200, width: '100%' }} />
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="edit-work-page">
        <div className="edit-work-not-found">
          <p>{t('editWork.notFound')}</p>
          <button onClick={() => navigate('/')}>{t('editWork.backToHome')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-work-page">
      <motion.div
        className="edit-work-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="edit-work-title">
          <span className="gradient-text">{t('editWork.title')}</span>
        </h1>

        {error && (
          <motion.div
            className="edit-work-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form className="edit-work-form" onSubmit={handleSubmit}>
          <div className="edit-work-field">
            <label>{t('editWork.workTitle')}</label>
            <input
              type="text"
              placeholder={t('editWork.workTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="edit-work-field">
            <label>{t('editWork.workDesc')}</label>
            <textarea
              placeholder={t('editWork.workDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="edit-work-field">
            <label>{t('editWork.externalLink')}</label>
            <div className="edit-work-input-with-icon">
              <LinkIcon size={18} className="edit-work-input-icon" />
              <input
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          <div className="edit-work-field">
            <label>{t('editWork.coverMode')}</label>
            <div className="edit-work-cover-mode">
              <button
                type="button"
                className={`edit-work-cover-mode-btn ${coverMode === 'upload' ? 'active' : ''}`}
                onClick={() => setCoverMode('upload')}
              >
                <ImageIcon size={16} /> {t('editWork.uploadImage')}
              </button>
              <button
                type="button"
                className={`edit-work-cover-mode-btn ${coverMode === 'default' ? 'active' : ''}`}
                onClick={() => setCoverMode('default')}
              >
                <Palette size={16} /> {t('editWork.defaultCover')}
              </button>
            </div>
          </div>

          {coverMode === 'upload' ? (
            <ImageUploader
              images={existingCoverUrl && coverMode === 'upload' ? [{ url: existingCoverUrl }] : []}
              onChange={(files) => {
                setCoverFile(files[0] || null)
                if (files[0]) setExistingCoverUrl('')
              }}
              maxImages={1}
              label={t('editWork.coverImage')}
            />
          ) : (
            <DefaultCoverPicker
              coverBg={coverBg}
              coverEmoji={coverEmoji}
              onCoverBgChange={setCoverBg}
              onCoverEmojiChange={setCoverEmoji}
            />
          )}

          <ImageUploader
            images={existingImages.map(url => ({ url }))}
            onChange={(items) => {
              const newFiles = items.filter(item => item.file).map(item => item.file)
              const remainingUrls = items.filter(item => !item.file).map(item => item.url)
              setImageFiles(newFiles)
              setExistingImages(remainingUrls)
            }}
            maxImages={5}
            label={t('editWork.moreScreenshots')}
          />

          <div className="edit-work-field">
            <label>{t('editWork.tags')}</label>
            <div className="edit-work-tags">
              {tags.map(tag => (
                <span key={tag} className="edit-work-tag">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <div className="edit-work-input-with-icon">
              <Tag size={18} className="edit-work-input-icon" />
              <input
                type="text"
                placeholder={t('editWork.tagPlaceholder')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            <div className="edit-work-suggested-tags">
              {suggestedTags.filter(t => !tags.includes(t)).slice(0, 6).map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="edit-work-suggested-tag"
                  onClick={() => handleAddTag(tag)}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 平台选择 */}
          <div className="edit-work-field">
            <label>{t('publish.platform')}</label>
            <div className="edit-work-platform-select">
              {PLATFORM_TYPES.map(p => {
                const Icon = p.value === 'mobile' ? Smartphone : Monitor
                return (
                  <button
                    key={p.value}
                    type="button"
                    className={`edit-work-platform-btn ${platform === p.value ? 'active' : ''}`}
                    onClick={() => setPlatform(p.value)}
                  >
                    <Icon size={18} />
                    <span>{p.label[locale === 'en' ? 'en' : 'zh']}</span>
                    {platform === p.value && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 内容分类 */}
          <div className="edit-work-field">
            <label>{t('publish.category')}</label>
            <div className="edit-work-chips">
              {CONTENT_CATEGORIES.map(cat => {
                const Icon = cat.value === 'showcase' ? Eye : cat.value === 'product' ? Rocket : FlaskConical
                return (
                  <button
                    key={cat.value}
                    type="button"
                    className={`edit-work-chip ${category === cat.value ? 'active' : ''}`}
                    style={category === cat.value ? { borderColor: cat.color, color: cat.color, background: `${cat.color}15` } : {}}
                    onClick={() => setCategory(cat.value)}
                  >
                    {category === cat.value && <Check size={12} />}
                    <Icon size={14} />
                    {cat.label[locale === 'en' ? 'en' : 'zh']}
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI 工具 */}
          <div className="edit-work-field">
            <label>{t('publish.aiTools')}</label>
            <div className="edit-work-chips">
              {AI_TOOLS.map(tool => (
                <button
                  key={tool.value}
                  type="button"
                  className={`edit-work-chip ${selectedTools.includes(tool.value) ? 'active' : ''}`}
                  style={selectedTools.includes(tool.value) ? { borderColor: tool.color, color: tool.color, background: `${tool.color}15` } : {}}
                  onClick={() => toggleTool(tool.value)}
                >
                  {selectedTools.includes(tool.value) && <Check size={12} />}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI 模型 */}
          <div className="edit-work-field">
            <label>{t('publish.aiModels')}</label>
            <div className="edit-work-chips">
              {AI_MODELS.map(model => (
                <button
                  key={model.value}
                  type="button"
                  className={`edit-work-chip ${selectedModels.includes(model.value) ? 'active' : ''}`}
                  style={selectedModels.includes(model.value) ? { borderColor: model.color, color: model.color, background: `${model.color}15` } : {}}
                  onClick={() => toggleModel(model.value)}
                >
                  {selectedModels.includes(model.value) && <Check size={12} />}
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          {/* 元数据字段 */}
          <div className="edit-work-field">
            <label>{t('publish.toolsUsed')}</label>
            <input
              type="text"
              placeholder={t('publish.toolsPlaceholder')}
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
            />
          </div>

          <div className="edit-work-field">
            <label>{t('publish.aiWorkflowLabel')}</label>
            <textarea
              placeholder={t('publish.aiWorkflowPlaceholder')}
              value={aiWorkflow}
              onChange={(e) => setAiWorkflow(e.target.value)}
              rows={3}
            />
          </div>

          <div className="edit-work-field">
            <label>{t('publish.devTime')}</label>
            <input
              type="text"
              placeholder={t('publish.devTimePlaceholder')}
              value={devTime}
              onChange={(e) => setDevTime(e.target.value)}
            />
          </div>

          <motion.button
            type="submit"
            className="edit-work-submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? t('editWork.saving') : t('editWork.saveBtn')}
            {!saving && <Save size={18} />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default EditWork
