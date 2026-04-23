import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang } from '../i18n/translations'

const STORAGE_KEY = 'chashka_lang'

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'es' || stored === 'en' || stored === 'uk') return stored
  return 'es'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof translations.es
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
