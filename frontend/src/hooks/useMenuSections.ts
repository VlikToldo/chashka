import { useState, useEffect, useMemo } from "react";
import type { PublicSection, MenuItem } from "../types/menu";
import { menuService } from "../services/menuService";

export function useMenuSections() {
  const [sections, setSections] = useState<PublicSection[]>([]);
  // All regular items keyed by sectionId — no per-section requests needed
  const [itemsMap, setItemsMap] = useState<Record<string, MenuItem[]>>({});
  const [allExtras, setAllExtras] = useState<MenuItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<"food" | "drinks">(
    "food",
  );
  const [activeSection, setActiveSection] = useState<PublicSection | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single parallel fetch on mount — all sections + all items + all extras
  useEffect(() => {
    Promise.all([
      menuService.getSections(),
      menuService.getAllItems(),
      menuService.getAllExtras(),
    ])
      .then(([sectionData, itemsData, extrasData]) => {
        setSections(sectionData);
        setAllExtras(extrasData);

        // Build lookup map: sectionId → MenuItem[]
        const map: Record<string, MenuItem[]> = {};
        for (const item of itemsData) {
          if (!map[item.sectionId]) map[item.sectionId] = [];
          map[item.sectionId].push(item);
        }
        setItemsMap(map);

        const first =
          sectionData.find((s) => s.category === "food") ??
          sectionData[0] ??
          null;
        setActiveSection(first);
      })
      .catch(() => setError("error"))
      .finally(() => setLoading(false));
  }, []);

  // When category filter changes, reset active section — no network request
  useEffect(() => {
    const first = sections.find((s) => s.category === categoryFilter) ?? null;
    setActiveSection(first);
  }, [categoryFilter, sections]);

  const filteredSections = useMemo(
    () => sections.filter((s) => s.category === categoryFilter),
    [sections, categoryFilter],
  );

  // Items for active section — pure local lookup, zero requests
  const items = useMemo(
    () => (activeSection ? (itemsMap[activeSection._id] ?? []) : []),
    [activeSection, itemsMap],
  );

  // Extras filtered to current category's sections
  const filteredSectionIds = useMemo(
    () => new Set(filteredSections.map((s) => s._id)),
    [filteredSections],
  );
  const categoryExtras = useMemo(
    () => allExtras.filter((e) => filteredSectionIds.has(e.sectionId)),
    [allExtras, filteredSectionIds],
  );

  // Extras for the currently active section
  const sectionExtras = useMemo(
    () =>
      activeSection
        ? allExtras.filter((e) => e.sectionId === activeSection._id)
        : [],
    [activeSection, allExtras],
  );

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
    loading,
    error,
  };
}
