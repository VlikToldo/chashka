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
import {
  parsePosition,
  getWrapperStyle,
  imgStyle,
} from "../utils/photoPosition";
import type { AboutBlock, AboutImage } from "../types/about";

function BlockImage({ img, alt }: { img: AboutImage; alt: string }) {
  const pos = parsePosition(img.position ?? "{}");
  return (
    <div className="w-full aspect-[5/4] overflow-hidden rounded-2xl shadow-md relative">
      {pos.ar !== undefined ? (
        <div style={getWrapperStyle(pos, 5 / 4)}>
          <img
            src={getOptimizedUrl(img.url)}
            alt={alt}
            loading="lazy"
            style={imgStyle}
          />
        </div>
      ) : (
        <img
          src={getOptimizedUrl(img.url)}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const { venue, slots } = useVenue();
  const address = venue.address[lang];
  const schedule =
    slots.length > 0
      ? formatSlots(slots, t.admin.days as Record<DayKey, string>)
      : ["—"];
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "https://chashka.cafe";
  useSeoMeta({
    title: `${t.about.heroTitle} | CHASHKA — El Campello, Valencia`,
    description: t.about.seoDescription,
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
      images: [],
    },
    {
      _id: "philosophy",
      title: { uk: t.about.philosophyTitle, en: t.about.philosophyTitle, es: t.about.philosophyTitle },
      text: { uk: t.about.philosophyText, en: t.about.philosophyText, es: t.about.philosophyText },
      images: [],
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

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading && <Loader />}

        {/* Dynamic blocks */}
        {!loading && (
          <div className="space-y-0">
            {displayBlocks.map((block, i) => {
              const title = localize(block.title, lang);
              const text = localize(block.text, lang);
              const isEven = i % 2 === 0;
              const images = block.images ?? [];
              const hasImages = images.length > 0;

              return (
                <motion.section
                  key={block._id ?? i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                >
                  <div className="h-px bg-border/40 mb-16" />

                  {hasImages ? (
                    <div
                      className={`flex flex-col md:flex-row ${
                        isEven ? "" : "md:flex-row-reverse"
                      } gap-10 md:gap-16 items-center mb-20`}
                    >
                      {/* Photos — slider on mobile, grid on desktop */}
                      <div className="w-full md:w-1/2 shrink-0">
                        {images.length === 1 ? (
                          /* Single image — full slot */
                          <BlockImage img={images[0]} alt={title} />
                        ) : (
                          <>
                            {/* Mobile: horizontal scroll-snap slider */}
                            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide pb-1">
                              {images.map((img, idx) => (
                                <div key={idx} className="flex-none w-[85%] snap-start">
                                  <BlockImage img={img} alt={title} />
                                </div>
                              ))}
                            </div>

                            {/* Desktop: grid */}
                            {images.length === 2 && (
                              /* 2 фото — діагональ: зверху-зліва + знизу-справа */
                              <div className="hidden md:grid grid-cols-2 gap-3">
                                <BlockImage img={images[0]} alt={title} />
                                <div className="aspect-[5/4]" />
                                <div className="aspect-[5/4]" />
                                <BlockImage img={images[1]} alt={title} />
                              </div>
                            )}
                            {images.length === 3 && (
                              /* 3 фото — 2 зверху, 1 знизу по центру того ж розміру */
                              <div className="hidden md:grid grid-cols-2 gap-3">
                                <BlockImage img={images[0]} alt={title} />
                                <BlockImage img={images[1]} alt={title} />
                                <div className="col-span-2 flex justify-center">
                                  <div className="w-[calc(50%-0.375rem)]">
                                    <BlockImage img={images[2]} alt={title} />
                                  </div>
                                </div>
                              </div>
                            )}
                            {images.length === 4 && (
                              /* 4 фото — 2×2 */
                              <div className="hidden md:grid grid-cols-2 gap-3">
                                {images.map((img, idx) => (
                                  <BlockImage key={idx} img={img} alt={title} />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Text */}
                      <div className="w-full md:w-1/2">
                        {title && (
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-5">
                            {title}
                          </h2>
                        )}
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                          {text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Text-only block */
                    <div className="max-w-2xl mx-auto text-center mb-20">
                      {title && (
                        <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-6">
                          {title}
                        </h2>
                      )}
                      <p className="text-muted-foreground leading-relaxed font-light text-lg">
                        {text}
                      </p>
                    </div>
                  )}
                </motion.section>
              );
            })}
          </div>
        )}

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center max-w-4xl mx-auto">
            {/* Schedule — left */}
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

            {/* Location + map — center */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium tracking-wide">
                  {t.footer.location}
                </span>
              </div>
              {address ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground leading-relaxed hover:text-foreground transition-colors"
                >
                  {address}
                </a>
              ) : !venue.mapEmbedUrl && (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              {venue.mapEmbedUrl && (
                <div className="rounded-xl overflow-hidden border border-border/30 shadow-sm">
                  <iframe
                    title="CHASHKA on Google Maps"
                    src={venue.mapEmbedUrl}
                    width="100%"
                    height="220"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block"
                  />
                </div>
              )}
            </div>

            {/* Instagram + phone — right */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Instagram size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium tracking-wide">
                  {t.footer.follow}
                </span>
              </div>
              {venue.instagramUrl ? (
                <a
                  href={venue.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  @{venue.instagramUrl.replace(/.*instagram\.com\//i, "").replace(/\/$/, "")}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              {venue.phone && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={13} />
                  <a
                    href={`tel:${venue.phone}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {venue.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.div
          className="text-center mt-16 pb-4"
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
