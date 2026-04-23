import { useState, useEffect } from "react";
import type { PublicSection, MenuItem } from "../types/menu";
import { menuService } from "../services/menuService";

export function useMenuSections() {
  const [sections, setSections] = useState<PublicSection[]>([]);
  const [activeSection, setActiveSection] = useState<PublicSection | null>(
    null,
  );
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sections on mount
  useEffect(() => {
    menuService
      .getSections()
      .then((data) => {
        setSections(data);
        if (data.length > 0) setActiveSection(data[0]);
      })
      .catch(() => setError("error"))
      .finally(() => setLoadingSections(false));
  }, []);

  // Load items when active section changes
  useEffect(() => {
    if (!activeSection) return;

    let cancelled = false;
    setLoadingItems(true);
    setError(null);

    menuService
      .getBySection(activeSection._id)
      .then((data) => {
        if (!cancelled) setItems(data);
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

  return {
    sections,
    activeSection,
    setActiveSection,
    items,
    loading: loadingSections || loadingItems,
    error,
  };
}
