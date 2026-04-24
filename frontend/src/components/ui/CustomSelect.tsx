import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Compact inline mode — use inside input rows (currency, unit) */
  inline?: boolean
  className?: string
}

export default function CustomSelect({ value, onChange, options, inline = false, className }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find(o => o.value === value)?.label ?? value

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [open])

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`absolute top-full mt-1 bg-background border border-border shadow-md z-50 overflow-y-auto ${
            inline ? "right-0 min-w-[4rem] max-h-48" : "left-0 right-0 max-h-48"
          }`}
        >
          {options.map(o => (
            <li key={o.value} role="option" aria-selected={value === o.value}>
              <button
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  value === o.value
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{o.label}</span>
                {value === o.value && <Check size={inline ? 10 : 13} className="ml-2 text-foreground/70 shrink-0" />}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  )

  if (inline) {
    return (
      <div ref={ref} className={`relative ${className ?? ""}`}>
        <button
          type="button"
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {selectedLabel}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <ChevronDown size={10} />
          </motion.span>
        </button>
        {dropdown}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between bg-transparent border-b border-border py-2 text-sm hover:border-foreground transition-colors text-left"
      >
        <span>{selectedLabel}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex text-muted-foreground shrink-0"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>
      {dropdown}
    </div>
  )
}
