import { useState, useEffect } from "react";
import type { PublicSection, MenuItem } from "../types/menu";
import { menuService } from "../services/menuService";

export function useMenuSections() {
  const [sections, setSections] = useState<PublicSection[]>([]);
  const [allExtras, setAllExtras] = useState<MenuItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<"food" | "drinks">(
    "food",
  );
  const [activeSection, setActiveSection] = useState<PublicSection | null>(
    null,
  );
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sections + all extras on mount
  useEffect(() => {
    Promise.all([menuService.getSections(), menuService.getAllExtras()])
      .then(([sectionData, extrasData]) => {
        setSections(sectionData);
        setAllExtras(extrasData);
        const first =
          sectionData.find((s) => s.category === "food") ??
          sectionData[0] ??
          null;
        setActiveSection(first);
      })
      .catch(() => setError("error"))
      .finally(() => setLoadingSections(false));
  }, []);

  // When category changes, reset active section to first in that category
  useEffect(() => {
    const first = sections.find((s) => s.category === categoryFilter) ?? null;
    setActiveSection(first);
  }, [categoryFilter, sections]);

  // Load items when active section changes
  useEffect(() => {
    if (!activeSection) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoadingItems(true);
    setError(null);

    menuService
      .getBySection(activeSection._id)
      .then((regular) => {
        if (!cancelled) setItems(regular);
      })
      .catch(() => {
        if (!cancelled) setError("error");
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const filteredSections = sections.filter(
    (s) => s.category === categoryFilter,
  );

  // Extras filtered to current category's sections
  const filteredSectionIds = new Set(filteredSections.map((s) => s._id));
  const categoryExtras = allExtras.filter((e) =>
    filteredSectionIds.has(e.sectionId),
  );

  // Extras for the currently active section
  const sectionExtras = activeSection
    ? allExtras.filter((e) => e.sectionId === activeSection._id)
    : [];

  return {
    sections,
    filteredSections,
    categoryFilter,
    setCategoryFilter,
    activeSection,
    setActiveSection,
    items,
    categoryExtras,
    sectionExtras,
    loading: loadingSections || loadingItems,
    error,
  };
}
