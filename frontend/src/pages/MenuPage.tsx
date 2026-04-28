import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuSection from "../components/MenuSection";
import Loader from "../components/ui/Loader";
import { useMenuSections } from "../hooks/useMenuSections";
import { useLanguage } from "../context/LanguageContext";
import { localize } from "../utils/localize";
import { useSeoMeta } from "../hooks/useSeoMeta";
import { discountService } from "../services/menuService";
import type { MenuItem } from "../types/menu";

const ExtraRow = memo(function ExtraRow({
  item,
  index = 0,
  discountPrice,
}: {
  item: MenuItem;
  index?: number;
  discountPrice?: string;
}) {
  const { lang } = useLanguage();
  const name = localize(item.name, lang);
  const yieldVal = localize(item.yield, lang);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: Math.min(index * 0.04, 0.3),
      }}
      className="flex items-center justify-between gap-4 py-4 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base font-light">{name}</span>
        {yieldVal && (
          <span className="text-xs text-muted-foreground/60 shrink-0">
            {yieldVal}
          </span>
        )}
      </div>
      {discountPrice ? (
        <span className="flex items-baseline gap-1.5 shrink-0">
          <s className="text-sm text-muted-foreground/60 tabular-nums">
            {item.price}
          </s>
          <span className="text-base font-light tabular-nums text-primary">
            {discountPrice}
          </span>
        </span>
      ) : (
        <span className="text-base font-light tabular-nums shrink-0">
          {item.price}
        </span>
      )}
    </motion.div>
  );
});

export default function MenuPage() {
  const { t, lang } = useLanguage();
  const {
    filteredSections,
    categoryFilter,
    setCategoryFilter,
    activeSection,
    setActiveSection,
    items,
    categoryExtras,
    sectionExtras,
    loading,
    error,
  } = useMenuSections();

  const [extrasActive, setExtrasActive] = useState(false);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    discountService
      .getActive()
      .then(setDiscounts)
      .catch(() => {});
  }, []);

  // Reset extras tab when category changes
  useEffect(() => {
    setExtrasActive(false);
  }, [categoryFilter]);

  const scrollToContent = () => {
    if (!contentRef.current) return;
    const top = contentRef.current.offsetTop - 64;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "https://chashka.com.es";
  useSeoMeta({
    title: `CHASHKA | ${t.hero.subtitle} — El Campello, Valencia`,
    description: t.hero.description,
    ogImage: `${siteUrl}/images/logo.png`,
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
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
                scrollToContent();
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
          <nav
            aria-label="Menu sections"
            className="border-b border-border"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-center gap-1 md:gap-8 py-4 overflow-x-auto">
                {filteredSections.map((section) => (
                  <button
                    key={section._id}
                    onClick={() => {
                      setActiveSection(section);
                      setExtrasActive(false);
                      scrollToContent();
                    }}
                    className={`px-4 py-2 text-sm md:text-base tracking-wide whitespace-nowrap transition-all duration-300 ${
                      !extrasActive && activeSection?._id === section._id
                        ? "text-foreground border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {localize(section.name, lang)}
                  </button>
                ))}
                {categoryExtras.length > 0 && (
                  <button
                    onClick={() => {
                      setExtrasActive(true);
                      scrollToContent();
                    }}
                    className={`px-4 py-2 text-sm md:text-base tracking-wide whitespace-nowrap transition-all duration-300 ${
                      extrasActive
                        ? "text-foreground border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.menu.extrasTab}
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Content */}
      <section
        ref={contentRef}
        className="max-w-7xl mx-auto px-6 py-12 md:py-20"
      >
        {loading && <Loader />}
        {error && (
          <p className="text-center text-red-500 py-20">{t.menu.error}</p>
        )}

        {!loading && !error && extrasActive && (
          <AnimatePresence mode="wait">
            <motion.div
              key="extras-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-light text-center mb-12 md:mb-16">
                {t.menu.extrasTab}
              </h2>
              <div className="max-w-3xl mx-auto">
                {categoryExtras.map((item, i) => (
                  <ExtraRow
                    key={
                      item._id ?? item.name.es ?? item.name.uk ?? item.name.en
                    }
                    item={item}
                    index={i}
                    discountPrice={item._id ? discounts[item._id] : undefined}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && !error && !extrasActive && activeSection && (
          <MenuSection
            title={localize(activeSection.name, lang)}
            items={items}
            extras={sectionExtras}
            discounts={discounts}
          />
        )}
        {!loading && !error && filteredSections.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            {t.menu.noItems}
          </p>
        )}
      </section>

      <Footer />
    </main>
  );
}
