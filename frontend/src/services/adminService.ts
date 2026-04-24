import axios from "axios";
import type {
  Section,
  AdminMenuItem,
  TimeSlot,
  AdminProfile,
  VenueInfo,
} from "../types/admin";
import type { AboutBlock } from "../types/about";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/admin`
  : "/api/admin";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminService = {
  // Auth
  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: { _id: string; email: string } }> => {
    const { data } = await api.post("/login", { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    secretCode: string,
  ): Promise<{ token: string; user: { _id: string; email: string } }> => {
    const { data } = await api.post("/register", {
      email,
      password,
      secretCode,
    });
    return data;
  },

  // Sections
  getSections: async (): Promise<Section[]> => {
    const { data } = await api.get("/sections");
    return data;
  },

  createSection: async (section: Omit<Section, "_id">): Promise<Section> => {
    const { data } = await api.post("/sections", section);
    return data;
  },

  updateSection: async (
    id: string,
    section: Partial<Section>,
  ): Promise<Section> => {
    const { data } = await api.put(`/sections/${id}`, section);
    return data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await api.delete(`/sections/${id}`);
  },

  reorderSections: async (
    items: { id: string; order: number }[],
  ): Promise<void> => {
    await api.patch("/sections/reorder", items);
  },

  // Menu Items
  getMenuItems: async (): Promise<AdminMenuItem[]> => {
    const { data } = await api.get("/menu-items");
    return data;
  },

  getExtras: async (sectionId: string): Promise<AdminMenuItem[]> => {
    const { data } = await api.get<AdminMenuItem[]>("/menu-items", {
      params: { sectionId, isExtra: true },
    });
    return data;
  },

  createMenuItem: async (
    item: Omit<AdminMenuItem, "_id">,
  ): Promise<AdminMenuItem> => {
    const { data } = await api.post("/menu-items", item);
    return data;
  },

  updateMenuItem: async (
    id: string,
    item: Partial<AdminMenuItem>,
  ): Promise<AdminMenuItem> => {
    const { data } = await api.put(`/menu-items/${id}`, item);
    return data;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
  },

  reorderMenuItems: async (
    items: { id: string; order: number }[],
  ): Promise<void> => {
    await api.patch("/menu-items/reorder", items);
  },

  uploadMenuItemImage: async (
    id: string,
    file: File,
  ): Promise<{ image: string }> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post(`/menu-items/${id}/image`, form);
    return data;
  },

  // Working Hours
  getWorkingHours: async (): Promise<{ slots: TimeSlot[] }> => {
    const { data } = await api.get("/working-hours");
    return data;
  },

  updateWorkingHours: async (
    slots: TimeSlot[],
  ): Promise<{ slots: TimeSlot[] }> => {
    const { data } = await api.put("/working-hours", { slots });
    return data;
  },

  // Cover Photo
  getCoverPhoto: async (): Promise<{
    image: string;
    objectPosition: string;
  }> => {
    const { data } = await api.get("/cover-photo");
    return data;
  },

  uploadCoverPhoto: async (
    file: File,
    objectPosition?: string,
  ): Promise<{ image: string; objectPosition: string }> => {
    const form = new FormData();
    form.append("image", file);
    if (objectPosition) form.append("objectPosition", objectPosition);
    const { data } = await api.post("/cover-photo", form);
    return data;
  },

  updateCoverPhotoPosition: async (
    objectPosition: string,
  ): Promise<{ image: string; objectPosition: string }> => {
    const { data } = await api.put("/cover-photo/position", { objectPosition });
    return data;
  },

  // About blocks
  getAboutBlocks: async (): Promise<AboutBlock[]> => {
    const { data } = await api.get("/about");
    return data;
  },

  createAboutBlock: async (
    block: Omit<AboutBlock, "_id">,
  ): Promise<AboutBlock> => {
    const { data } = await api.post("/about", block);
    return data;
  },

  updateAboutBlock: async (
    id: string,
    block: Partial<AboutBlock>,
  ): Promise<AboutBlock> => {
    const { data } = await api.put(`/about/${id}`, block);
    return data;
  },

  deleteAboutBlock: async (id: string): Promise<void> => {
    await api.delete(`/about/${id}`);
  },

  reorderAboutBlocks: async (ids: string[]): Promise<void> => {
    await api.put("/about/reorder", { ids });
  },

  uploadAboutBlockImage: async (
    id: string,
    file: File,
  ): Promise<{ image: string }> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post(`/about/${id}/image`, form);
    return data;
  },

  // Profile
  getProfile: async (): Promise<AdminProfile> => {
    const { data } = await api.get("/profile");
    return data;
  },

  updateProfile: async (
    patch: Partial<Pick<AdminProfile, "email" | "firstName" | "lastName">>,
  ): Promise<AdminProfile> => {
    const { data } = await api.put("/profile", patch);
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.put("/password", { currentPassword, newPassword });
  },

  // Venue
  getVenue: async (): Promise<VenueInfo> => {
    const { data } = await api.get("/venue");
    return data;
  },

  updateVenue: async (venue: { address?: string; phone?: string }): Promise<VenueInfo> => {
    const { data } = await api.put("/venue", venue);
    return data;
  },
};
