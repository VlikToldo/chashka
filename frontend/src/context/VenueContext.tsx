import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { venueService } from "../services/menuService";
import type { VenueInfo, TimeSlot } from "../types/admin";

const DEFAULT_VENUE: VenueInfo = {
  address: { uk: "", en: "", es: "" },
  phone: "",
  mapEmbedUrl: "",
};

interface VenueContextValue {
  venue: VenueInfo;
  slots: TimeSlot[];
  refresh: () => void;
}

const VenueContext = createContext<VenueContextValue>({
  venue: DEFAULT_VENUE,
  slots: [],
  refresh: () => {},
});

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venue, setVenue] = useState<VenueInfo>(DEFAULT_VENUE);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  const load = () => {
    venueService
      .getVenue()
      .then(setVenue)
      .catch((err) => console.error("[VenueContext] Failed to load venue:", err));
    venueService
      .getWorkingHours()
      .then(setSlots)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <VenueContext.Provider value={{ venue, slots, refresh: load }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  return useContext(VenueContext);
}
