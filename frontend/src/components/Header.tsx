import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram } from "lucide-react";
import Loader from "./ui/Loader";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useVenue } from "../context/VenueContext";
import { useToast } from "../context/ToastContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { coverPhotoService } from "../services/menuService";
import {
  parsePosition,
  getWrapperStyle,
  imgStyle,
  DEFAULT_POSITION,
  type PhotoPosition,
} from "../utils/photoPosition";
import { getOptimizedUrl } from "../utils/imageUrl";
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState<PhotoPosition>(DEFAULT_POSITION);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoVisible, setLogoVisible] = useState(false);
  const { t, lang } = useLanguage();
  const { venue } = useVenue();
  const { showToast } = useToast();
  const location = useLocation();

  const handleInstagram = (e: React.MouseEvent) => {
    if (!venue.instagramUrl) {
      e.preventDefault();
      showToast(t.footer.instagramNotAdded, "info");
    }
  };
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    coverPhotoService
      .getPhoto()
      .then(({ image, objectPosition }) => {
        setLogoSrc(image);
        setLogoPos(parsePosition(objectPosition));
      })
      .catch(() => setLogoSrc(null))
      .finally(() => {
        setLogoLoading(false);
        setTimeout(() => setLogoVisible(true), 50);
      });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const navLinkClass =
    "text-sm tracking-wide hover:text-muted-foreground transition-colors";

  return (
    <header ref={headerRef} className="relative z-50">
      {/* Top bar */}
      <div className="bg-primary/30 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
          <LanguageSwitcher />
          <Link
            to="/admin/login"
            className="hidden md:block text-[10px] tracking-[0.15em] uppercase text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto flex items-center px-6 py-4 md:py-6">
        {/* Mobile: hamburger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden p-2 -ml-2"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop: left nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          <Link to="/" className={navLinkClass}>
            {t.nav.menu}
          </Link>
          <Link to="/about" className={navLinkClass}>
            {t.nav.about}
          </Link>
        </nav>

        {/* Logo */}
        <Link to="/" className="flex flex-col items-center mx-auto md:mx-0">
          <div
            className="w-[168px] h-[168px] md:w-[288px] md:h-[288px] rounded-full overflow-hidden bg-primary/20 flex items-center justify-center relative"
            style={{
              opacity: logoVisible ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          >
            {logoLoading ? (
              <Loader size={28} className="py-0" />
            ) : logoSrc ? (
              <div style={getWrapperStyle(logoPos)}>
                <img
                  src={getOptimizedUrl(logoSrc)}
                  alt="CHASHKA Coffee Shop Logo"
                  style={imgStyle}
                />
              </div>
            ) : (
              <span className="font-serif text-base md:text-lg tracking-[0.2em] text-foreground/70 text-center leading-tight px-2">
                CHASHKA
              </span>
            )}
          </div>
        </Link>

        {/* Desktop: right nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-end">
          <a href="#contact" className={navLinkClass}>
            {t.nav.contact}
          </a>
          <a
            href={venue.instagramUrl || "#"}
            target={venue.instagramUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
            aria-label="Instagram"
            onClick={handleInstagram}
          >
            <Instagram size={16} />
          </a>
        </nav>

        {/* Mobile: instagram */}
        <a
          href={venue.instagramUrl || "#"}
          target={venue.instagramUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="md:hidden p-2 -mr-2"
          aria-label="Instagram"
          onClick={handleInstagram}
        >
          <Instagram size={24} />
        </a>
      </div>

      {/* Mobile dropdown — animated */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-primary/30 shadow-sm"
          >
            <nav className="flex flex-col items-center py-8 gap-6">
              <Link
                to="/"
                className="text-lg tracking-wide hover:text-muted-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t.nav.menu}
              </Link>
              <Link
                to="/about"
                className="text-lg tracking-wide hover:text-muted-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t.nav.about}
              </Link>
              <a
                href="#contact"
                className="text-lg tracking-wide hover:text-muted-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t.nav.contact}
              </a>

              <div className="h-px w-24 bg-border/50" />

              <div className="h-px w-24 bg-border/50" />

              <Link
                to="/admin/login"
                className="text-xs tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
