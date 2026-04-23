import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { venueService } from "../services/menuService";
import type { VenueInfo } from "../types/admin";

const DEFAULT_VENUE: VenueInfo = {
  address: { uk: "", en: "", es: "" },
  phone: "",
};

interface VenueContextValue {
  venue: VenueInfo;
  refresh: () => void;
}

const VenueContext = createContext<VenueContextValue>({
  venue: DEFAULT_VENUE,
  refresh: () => {},
});

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venue, setVenue] = useState<VenueInfo>(DEFAULT_VENUE);

  const load = () => {
    venueService
      .getVenue()
      .then(setVenue)
      .catch((err) => console.error("[VenueContext] Failed to load venue:", err));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <VenueContext.Provider value={{ venue, refresh: load }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  return useContext(VenueContext);
}
