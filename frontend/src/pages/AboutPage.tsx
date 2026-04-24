import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Loader from "../components/ui/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { useVenue } from "../context/VenueContext";
import { formatSlots } from "../utils/formatSchedule";
import type { DayKey } from "../types/admin";
import { aboutService } from "../services/menuService";
import { localize } from "../utils/localize";
import { useSeoMeta } from "../hooks/useSeoMeta";
import { getOptimizedUrl } from "../utils/imageUrl";
import type { AboutBlock } from "../types/about";

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const { venue, slots } = useVenue();
  const address = venue.address[lang];
  const schedule = slots.length > 0
    ? formatSlots(slots, t.admin.days as Record<DayKey, string>)
    : t.footer.schedule as string[];
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "https://chashka.cafe";
  useSeoMeta({
    title: `${t.about.heroTitle} | CHASHKA — El Campello, Valencia`,
    description: t.about.heroSubtitle,
    ogImage: `${siteUrl}/images/logo.png`,
    canonical: `${siteUrl}/about`,
    lang,
  });

  useEffect(() => {
    aboutService
      .getBlocks()
      .then(setBlocks)
      .catch(() => setBlocks([]))
      .finally(() => setLoading(false));
  }, []);

  // Fallback blocks from translations if API returns nothing
  const fallbackBlocks: AboutBlock[] = [
    {
      _id: "story",
      title: { uk: t.about.storyTitle, en: t.about.storyTitle, es: t.about.storyTitle },
      text: { uk: t.about.storyText, en: t.about.storyText, es: t.about.storyText },
    },
    {
      _id: "philosophy",
      title: { uk: t.about.philosophyTitle, en: t.about.philosophyTitle, es: t.about.philosophyTitle },
      text: { uk: t.about.philosophyText, en: t.about.philosophyText, es: t.about.philosophyText },
    },
  ];

  const displayBlocks = blocks.length > 0 ? blocks : fallbackBlocks;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="max-w-5xl mx-auto"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t.hero.subtitle}
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            {t.about.heroTitle}
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            {t.about.heroSubtitle}
          </p>
          <Link
            to="/"
            className="inline-block mt-8 text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground transition-all duration-300 pb-0.5"
          >
            {t.nav.menu}
          </Link>
        </motion.div>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-20">
        {loading && <Loader />}

        {/* Dynamic blocks from API */}
        {!loading &&
          displayBlocks.map((block, i) => (
            <motion.section
              key={block._id ?? i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div className="h-px bg-border/50 mb-12" />
              <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-6">
                {localize(block.title, lang)}
              </h2>
              {block.image && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={getOptimizedUrl(block.image)}
                    alt={localize(block.title, lang)}
                    loading="lazy"
                    className="w-full max-w-md h-72 object-cover rounded"
                  />
                </div>
              )}
              <p className="text-muted-foreground leading-relaxed font-light text-lg">
                {localize(block.text, lang)}
              </p>
            </motion.section>
          ))}

        {/* Contact */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-px bg-border/50 mb-12" />
          <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-10 text-center">
            {t.about.contactTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium tracking-wide">
                  {t.footer.location}
                </span>
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
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium tracking-wide">
                  {t.footer.hours}
                </span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {schedule.map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Instagram size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium tracking-wide">
                  {t.footer.follow}
                </span>
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
        </motion.section>

        <motion.div
          className="text-center pb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground transition-all duration-300 pb-0.5"
          >
            {t.nav.menu}
          </Link>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
