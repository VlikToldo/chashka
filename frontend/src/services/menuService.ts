import axios from "axios";
import type { PublicSection, MenuItem } from "../types/menu";
import type { AboutBlock } from "../types/about";
import type { VenueInfo, TimeSlot } from "../types/admin";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({ baseURL: BASE });

export const menuService = {
  getSections: async (): Promise<PublicSection[]> => {
    const { data } = await api.get<PublicSection[]>("/sections");
    return data;
  },

  getAllItems: async (): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItem[]>("/menu", {
      params: { isExtra: false },
    });
    return data;
  },

  getAllExtras: async (): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItem[]>("/menu", {
      params: { isExtra: true },
    });
    return data;
  },

  // Kept for potential direct usage elsewhere
  getBySection: async (sectionId: string): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItem[]>("/menu", {
      params: { sectionId, isExtra: false },
    });
    return data;
  },
};

export const aboutService = {
  getBlocks: async (): Promise<AboutBlock[]> => {
    const { data } = await api.get<AboutBlock[]>("/about");
    return data;
  },
};

export const coverPhotoService = {
  getPhoto: async (): Promise<{
    image: string | null;
    objectPosition: string;
  }> => {
    const { data } = await api.get<{ image: string; objectPosition?: string }>(
      "/cover-photo",
    );
    return {
      image: data.image ?? null,
      objectPosition: data.objectPosition ?? "{}",
    };
  },
};

export const splashService = {
  getPhoto: async (): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const { data } = await api.get<{
      image: string | null;
      objectPosition?: string;
      enabled: boolean;
    }>("/splash");
    return {
      image: data.image ?? null,
      objectPosition: data.objectPosition ?? "{}",
      enabled: data.enabled,
    };
  },
};

export const venueService = {
  getVenue: async (): Promise<VenueInfo> => {
    const { data } = await api.get<VenueInfo>("/venue");
    return data;
  },
  getWorkingHours: async (): Promise<TimeSlot[]> => {
    const { data } = await api.get<{ slots: TimeSlot[] }>("/working-hours");
    return data.slots ?? [];
  },
};
