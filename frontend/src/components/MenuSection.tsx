import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { MenuItem } from "../types/menu";
import { useLanguage } from "../context/LanguageContext";
import { localize } from "../utils/localize";
import { getOptimizedUrl } from "../utils/imageUrl";

interface Props {
  title: string;
  items: MenuItem[];
  extras?: MenuItem[];
}

function PhotoModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
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

const MenuItemRow = memo(function MenuItemRow({
  item,
  index = 0,
}: {
  item: MenuItem;
  index?: number;
}) {
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
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
          delay: Math.min(index * 0.05, 0.4),
        }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoOpen(true);
                    }}
                  >
                    <img
                      src={getOptimizedUrl(item.image)}
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
          src={getOptimizedUrl(item.image)}
          alt={name}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </>
  );
});

const ExtraItem = memo(function ExtraItem({
  item,
  index = 0,
}: {
  item: MenuItem;
  index?: number;
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
      className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/30 last:border-b-0 sm:[&:nth-last-child(2):not(:nth-child(odd))]:border-b-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-light truncate">{name}</span>
        {yieldVal && (
          <span className="text-[11px] text-muted-foreground/60 shrink-0">
            {yieldVal}
          </span>
        )}
      </div>
      <span className="text-sm font-light tabular-nums shrink-0">
        {item.price}
      </span>
    </motion.div>
  );
});

export default function MenuSection({ title, items, extras = [] }: Props) {
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
        <motion.h2
          className="text-3xl md:text-4xl font-light text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {title}
        </motion.h2>

        {/* Extras block */}
        {extras.length > 0 && (
          <motion.div
            className="max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/60 text-center mb-5">
              {t.menu.extras}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border border-border/40 bg-muted/20">
              {extras.map((item, i) => (
                <ExtraItem
                  key={item._id ?? item.name.es ?? item.name.uk ?? item.name.en}
                  item={item}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            {t.menu.noSectionItems}
          </p>
        ) : (
          <div className="max-w-3xl mx-auto space-y-0">
            {items.map((item, i) => (
              <MenuItemRow
                key={item._id ?? item.name.es ?? item.name.uk ?? item.name.en}
                item={item}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
