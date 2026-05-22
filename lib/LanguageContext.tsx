'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Lang, TranslationKey, t as translate } from './i18n'

interface LanguageContextType {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => translate(key, 'en'),
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('jam-lang') as Lang | null
    if (stored === 'en' || stored === 'id') {
      setLang(stored)
    }
  }, [])

  function toggleLang() {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'id' : 'en'
      localStorage.setItem('jam-lang', next)
      return next
    })
  }

  function t(key: TranslationKey): string {
    return translate(key, lang)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
