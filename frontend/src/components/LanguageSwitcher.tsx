import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { LANG_LABELS, type Lang } from '../i18n/translations'

const LANGS: Lang[] = ['es', 'en', 'uk']
const LANG_SHORT: Record<Lang, string> = { es: 'ES', en: 'EN', uk: 'UA' }

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1 text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-primary/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {LANG_SHORT[lang]}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown size={11} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-36 bg-background border border-border rounded-lg shadow-md overflow-hidden z-50"
          >
            {LANGS.map(l => (
              <li key={l} role="option" aria-selected={lang === l}>
                <button
                  onClick={() => { setLang(l); setOpen(false) }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    lang === l
                      ? 'text-foreground bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{LANG_LABELS[l]}</span>
                  {lang === l && <Check size={13} className="text-foreground/70" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
