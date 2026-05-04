import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuSection from "../components/MenuSection";
import Loader from "../components/ui/Loader";
import { useMenuSections } from "../hooks/useMenuSections";
import { useLanguage } from "../context/LanguageContext";
import { localize } from "../utils/localize";
import { useSeoMeta } from "../hooks/useSeoMeta";
import { discountService } from "../services/menuService";

export default function MenuPage() {
  const { t, lang } = useLanguage();
  const {
    filteredSections,
    categoryFilter,
    setCategoryFilter,
    itemsMap,
    allExtras,
    loading,
    error,
  } = useMenuSections();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});

  const contentRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    discountService
      .getActive()
      .then(setDiscounts)
      .catch(() => {});
  }, []);

  // Reset active section when category changes
  useEffect(() => {
    setActiveSectionId(filteredSections[0]?._id ?? null);
  }, [categoryFilter, filteredSections]);

  // Scroll spy: track which section is currently in view
  useEffect(() => {
    if (!filteredSections.length) return;

    const handleScroll = () => {
      const stickyHeight = stickyRef.current?.offsetHeight ?? 120;
      const offset = stickyHeight + 32;

      // Last section whose top edge is at or above the offset line
      let currentId = filteredSections[0]?._id ?? null;
      for (const section of filteredSections) {
        const el = sectionRefs.current.get(section._id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          currentId = section._id;
        }
      }
      setActiveSectionId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredSections]);

  // Auto-scroll the nav bar to keep active tab visible
  useEffect(() => {
    if (!activeSectionId || !navRef.current) return;
    const btn = navRef.current.querySelector<HTMLElement>(
      `[data-section-id="${activeSectionId}"]`,
    );
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeSectionId]);

  const stickyHeight = () => stickyRef.current?.offsetHeight ?? 120;

  const scrollToContent = (instant = false) => {
    if (!contentRef.current) return;
    const top = contentRef.current.offsetTop - stickyHeight();
    window.scrollTo({ top: Math.max(0, top), behavior: instant ? "instant" : "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current.get(sectionId);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - stickyHeight() - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "https://chashka.com.es";
  useSeoMeta({
    title: `CHASHKA | ${t.hero.subtitle} — El Campello, Valencia`,
    description: t.hero.description,
    ogImage: `${siteUrl}/images/og-image.jpg`,
    canonical: `${siteUrl}/`,
    lang,
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-6 text-center">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t.hero.subtitle}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto">
            {t.hero.description}
          </p>
          <Link
            to="/about"
            className="inline-block mt-8 text-xs tracking-[0.25em] uppercase text-muted-foreground/60 hover:text-foreground border-b border-transparent hover:border-foreground/30 transition-all duration-300"
          >
            {t.nav.about}
          </Link>
        </motion.div>
      </section>

      {/* Sticky header: category toggle + section nav */}
      <div ref={stickyRef} className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        {/* Food / Drinks toggle */}
        <motion.div
          className="flex justify-center gap-0 border-b border-border"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {(["food", "drinks"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                scrollToContent(true);
              }}
              className={`px-10 py-3 text-sm tracking-[0.2em] uppercase transition-colors ${
                categoryFilter === cat
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "food" ? t.menu.food : t.menu.drinks}
            </button>
          ))}
        </motion.div>

        {/* Section nav */}
        {filteredSections.length > 0 && (
          <nav aria-label="Menu sections" className="border-b border-border">
            <div
              ref={navRef}
              className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-1 md:gap-8 py-4 px-6 w-max mx-auto">
                {filteredSections.map((section) => (
                  <button
                    key={section._id}
                    data-section-id={section._id}
                    onClick={() => scrollToSection(section._id)}
                    className={`px-4 py-2 text-sm md:text-base tracking-wide whitespace-nowrap transition-all duration-300 ${
                      activeSectionId === section._id
                        ? "text-foreground border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {localize(section.name, lang)}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Content — all sections rendered at once for scroll */}
      <section
        ref={contentRef}
        className="max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-20"
      >
        {loading && <Loader />}
        {error && (
          <p className="text-center text-red-500 py-20">{t.menu.error}</p>
        )}

        {!loading && !error && filteredSections.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            {t.menu.noItems}
          </p>
        )}

        {!loading &&
          !error &&
          filteredSections.map((section) => (
            <div
              key={section._id}
              ref={(el) => {
                if (el) sectionRefs.current.set(section._id, el);
                else sectionRefs.current.delete(section._id);
              }}
              className="mb-24 md:mb-32 last:mb-0"
            >
              <MenuSection
                title={localize(section.name, lang)}
                items={itemsMap[section._id] ?? []}
                extras={allExtras.filter((e) => e.sectionId === section._id)}
                discounts={discounts}
              />
            </div>
          ))}
      </section>

      <Footer />
    </main>
  );
}
