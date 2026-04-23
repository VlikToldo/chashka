import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuSection from "../components/MenuSection";
import Loader from "../components/ui/Loader";
import { useMenuSections } from "../hooks/useMenuSections";
import { useLanguage } from "../context/LanguageContext";
import { localize } from "../utils/localize";
import { useSeoMeta } from "../hooks/useSeoMeta";

export default function MenuPage() {
  const { t, lang } = useLanguage();
  const { sections, activeSection, setActiveSection, items, loading, error } =
    useMenuSections();

  useSeoMeta({
    title: `${t.hero.title} | CHASHKA`,
    description: t.hero.description,
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {t.hero.subtitle}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto">
            {t.hero.description}
          </p>
        </div>
      </section>

      {/* Category nav */}
      {sections.length > 0 && (
        <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center gap-1 md:gap-8 py-4 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section._id}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 text-sm md:text-base tracking-wide whitespace-nowrap transition-all duration-300 ${
                    activeSection?._id === section._id
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

      {/* Menu items */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {loading && <Loader />}
        {error && (
          <p className="text-center text-red-500 py-20">{t.menu.error}</p>
        )}
        {!loading && !error && activeSection && (
          <MenuSection
            title={localize(activeSection.name, lang)}
            items={items}
          />
        )}
        {!loading && !error && sections.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            {t.menu.noItems}
          </p>
        )}
      </section>

      <Footer />
    </main>
  );
}
