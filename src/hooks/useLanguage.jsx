import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import zh from '../i18n/zh'
import en from '../i18n/en'

const translations = { zh, en }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'zh'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
  }, [locale])

  const t = useCallback((key, params = {}) => {
    let text = translations[locale]?.[key] || translations.zh[key] || key
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
    })
    return text
  }, [locale])

  function toggleLocale() {
    setLocale(prev => prev === 'zh' ? 'en' : 'zh')
  }

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage 必须在 LanguageProvider 内使用')
  }
  return context
}
