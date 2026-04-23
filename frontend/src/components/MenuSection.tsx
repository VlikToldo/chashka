import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { MenuItem } from "../types/menu";
import { useLanguage } from "../context/LanguageContext";
import { localize } from "../utils/localize";

interface Props {
  title: string;
  items: MenuItem[];
}

function PhotoModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="photo-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="photo-content"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
          <img
            src={src}
            alt={alt}
            className="w-full max-h-[80vh] object-contain rounded"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const MenuItemRow = memo(function MenuItemRow({ item }: { item: MenuItem }) {
  const { lang, t } = useLanguage();
  const name = localize(item.name, lang);
  const ingredients = localize(item.ingredients, lang);
  const allergens = localize(item.allergens, lang);
  const yieldVal = localize(item.yield, lang);
  const hasDetails = !!(item.image || allergens || yieldVal);
  const [expanded, setExpanded] = useState(true);
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group border-b border-border/50 last:border-b-0"
      >
        <div
          className={`py-5 ${hasDetails ? "cursor-pointer" : ""}`}
          onClick={() => hasDetails && setExpanded((p) => !p)}
        >
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-medium tracking-wide group-hover:text-primary transition-colors">
                  {name}
                </h3>
                {hasDetails && (
                  <span className="text-xs text-muted-foreground select-none">
                    {expanded ? "−" : "+"}
                  </span>
                )}
              </div>
              {ingredients && (
                <p className="text-sm text-muted-foreground mt-1 font-light">
                  {ingredients}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="hidden sm:block h-px bg-border/50 w-16 group-hover:bg-primary/30 transition-colors" />
              <span className="text-lg md:text-xl font-light tabular-nums">
                {item.price}
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hasDetails && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6 space-y-4">
                {item.image ? (
                  <div
                    className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden bg-muted cursor-zoom-in"
                    onClick={(e) => { e.stopPropagation(); setPhotoOpen(true); }}
                  >
                    <img
                      src={item.image}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : null}

                {(allergens || yieldVal) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground font-light">
                    {allergens && (
                      <span>
                        <span className="text-xs tracking-wide uppercase mr-1.5">
                          {t.menu.allergens}:
                        </span>
                        {allergens}
                      </span>
                    )}
                    {yieldVal && (
                      <span>
                        <span className="text-xs tracking-wide uppercase mr-1.5">
                          {t.menu.yieldLabel}:
                        </span>
                        {yieldVal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {item.image && photoOpen && (
        <PhotoModal
          src={item.image}
          alt={name}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </>
  );
});

export default function MenuSection({ title, items }: Props) {
  const { t } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12 md:mb-16">
          {title}
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            {t.menu.noSectionItems}
          </p>
        ) : (
          <div className="max-w-3xl mx-auto space-y-0">
            {items.map((item) => (
              <MenuItemRow key={item._id ?? String(item.name)} item={item} />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
