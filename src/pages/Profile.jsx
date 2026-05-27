import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Edit3, Camera, Loader2 } from 'lucide-react'
import { sbQuery, uploadAvatar } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useWorks } from '../hooks/useWorks'
import { useLanguage } from '../hooks/useLanguage'
import WorkCard from '../components/WorkCard/WorkCard'
import AvatarCropper from '../components/AvatarCropper/AvatarCropper'
import './Profile.css'

const AVATAR_MAX_SIZE = 2 * 1024 * 1024 // 2MB
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

function Profile() {
  const { id } = useParams()
  const { user, profile: myProfile, updateProfile } = useAuth()
  const { works, loading, fetchWorks } = useWorks()
  const { t, locale } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [cropFile, setCropFile] = useState(null)
  const fileInputRef = useRef(null)

  const isOwn = user?.id === id

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setProfileLoading(true)
      try {
        const data = await sbQuery('profiles', {
          params: `?select=*&id=eq.${id}`
        })
        if (cancelled) return
        const profileData = data?.[0] || null
        setProfile(profileData)
        setBio(profileData?.bio || '')
      } catch {
        // silent
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
      fetchWorks({ page: 0, sort: 'latest', userId: id })
    }
    load()
    return () => { cancelled = true }
  }, [id, fetchWorks])

  async function handleSaveBio() {
    if (!isOwn) return
    const { error } = await updateProfile({ bio })
    if (!error) {
      setProfile({ ...profile, bio })
      setEditing(false)
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')

    if (file.size > AVATAR_MAX_SIZE) {
      setAvatarError(t('profile.avatarTooLarge'))
      return
    }

    setCropFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCropConfirm(blob) {
    setCropFile(null)
    setUploadingAvatar(true)
    try {
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      const url = await uploadAvatar(croppedFile, user.id)
      const { error } = await updateProfile({ avatar_url: url })
      if (!error) {
        setProfile({ ...profile, avatar_url: url })
      } else {
        setAvatarError(t('profile.avatarSaveFailed'))
      }
    } catch {
      setAvatarError(t('profile.avatarUploadFailed'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  // works 已通过 userId 参数服务端过滤
  const userWorks = works

  if (profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 200, height: 24 }} />
          <div className="skeleton" style={{ width: 300, height: 16 }} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <p>{t('profile.notFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-avatar-large" onClick={() => isOwn && fileInputRef.current?.click()}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" />
          ) : (
            <span>{(profile.username || '?')[0].toUpperCase()}</span>
          )}
          {isOwn && (
            <div className="profile-avatar-overlay">
              {uploadingAvatar ? (
                <Loader2 size={18} className="profile-avatar-spinner" />
              ) : (
                <Camera size={18} />
              )}
            </div>
          )}
        </div>
        {isOwn && (
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            onChange={handleAvatarChange}
            className="profile-avatar-input"
          />
        )}
        {avatarError && <p className="profile-avatar-error">{avatarError}</p>}

        {cropFile && (
          <AvatarCropper
            file={cropFile}
            onConfirm={handleCropConfirm}
            onCancel={() => setCropFile(null)}
            t={t}
          />
        )}

        <h1 className="profile-username">{profile.username}</h1>

        {editing ? (
          <div className="profile-bio-edit">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              rows={3}
            />
            <div className="profile-bio-actions">
              <button className="profile-bio-save" onClick={handleSaveBio}>{t('profile.save')}</button>
              <button className="profile-bio-cancel" onClick={() => { setEditing(false); setBio(profile.bio || '') }}>{t('profile.cancel')}</button>
            </div>
          </div>
        ) : (
          <div className="profile-bio">
            <p>{profile.bio || (isOwn ? t('profile.emptyBioOwn') : t('profile.emptyBioOther'))}</p>
            {isOwn && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <Edit3 size={14} />
                {t('profile.editBio')}
              </button>
            )}
          </div>
        )}

        <div className="profile-meta">
          <Calendar size={14} />
          <span>{t('profile.joinedAt', { date: new Date(profile.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) })}</span>
        </div>
      </motion.div>

      <div className="profile-works">
        <h2 className="profile-works-title">
          {isOwn ? t('profile.myWorks') : t('profile.userWorks', { username: profile.username })} ({userWorks.length})
        </h2>

        {loading ? (
          <div className="profile-works-loading">{t('profile.loading')}</div>
        ) : userWorks.length > 0 ? (
          <div className="profile-grid">
            {userWorks.map((work, index) => (
              <WorkCard key={work.id} work={work} index={index} />
            ))}
          </div>
        ) : (
          <div className="profile-works-empty">
            <p>{isOwn ? t('profile.emptyOwn') : t('profile.emptyOther')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
