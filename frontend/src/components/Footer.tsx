import { Instagram, MapPin, Clock, Heart, Phone } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useVenue } from '../context/VenueContext'
import { formatSlots } from '../utils/formatSchedule'
import type { DayKey } from '../types/admin'

export default function Footer() {
  const { t, lang } = useLanguage()
  const { venue, slots } = useVenue()
  const address = venue.address[lang]
  const schedule = slots.length > 0
    ? formatSlots(slots, t.admin.days as Record<DayKey, string>)
    : t.footer.schedule as string[]

  return (
    <footer id="contact" className="bg-primary/10 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-2">CHASHKA</h2>
          <p className="text-sm text-muted-foreground tracking-[0.2em] uppercase">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <MapPin size={18} />
              <span className="text-sm font-medium tracking-wide">{t.footer.location}</span>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground leading-relaxed hover:text-foreground transition-colors"
            >
              {address}
            </a>
            {venue.phone && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Phone size={13} />
                <a href={`tel:${venue.phone}`} className="hover:text-foreground transition-colors">
                  {venue.phone}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Clock size={18} />
              <span className="text-sm font-medium tracking-wide">{t.footer.hours}</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {schedule.map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Instagram size={18} />
              <span className="text-sm font-medium tracking-wide">{t.footer.follow}</span>
            </div>
            <a
              href="https://instagram.com/chashka.elcampello"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              @chashka.elcampello
            </a>
          </div>
        </div>

        <div className="h-px bg-border/50 my-12" />

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Heart size={14} className="text-red-400 fill-red-400" />
            {t.footer.love}
          </p>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} CHASHKA Coffee Shop. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
