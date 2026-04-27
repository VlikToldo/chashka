import axios from "axios";
import type {
  Section,
  AdminMenuItem,
  TimeSlot,
  AdminProfile,
  VenueInfo,
  Discount,
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

// Normalize API errors to a single { message } shape + handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? "";
    const isPublicAuthEndpoint =
      /\/(login|register|forgot-password|reset-password|verify-email|resend-verification)/.test(
        url,
      );

    if (error?.response?.status === 401 && !isPublicAuthEndpoint) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
      return Promise.reject(new Error("Сесія завершена. Увійдіть знову."));
    }

    const message: string =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      (error?.code === "ERR_NETWORK"
        ? "Сервер недоступний. Перевірте з'єднання."
        : null) ??
      error?.message ??
      "Невідома помилка";
    return Promise.reject(new Error(message));
  },
);

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

  duplicateMenuItem: async (id: string): Promise<AdminMenuItem> => {
    const { data } = await api.post(`/menu-items/${id}/duplicate`);
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
  ): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post(`/about/${id}/image`, form);
    return data;
  },

  updateAboutBlockImages: async (
    id: string,
    images: { url: string; position: string }[],
  ): Promise<AboutBlock> => {
    const { data } = await api.put(`/about/${id}/images`, { images });
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

  resendEmailChange: async (): Promise<void> => {
    await api.post("/email-change/resend");
  },

  cancelEmailChange: async (): Promise<AdminProfile> => {
    const { data } = await api.delete("/email-change");
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.put("/password", { currentPassword, newPassword });
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete("/account", { data: { password } });
  },

  // Venue
  getVenue: async (): Promise<VenueInfo> => {
    const { data } = await api.get("/venue");
    return data;
  },

  updateVenue: async (venue: {
    address?: string;
    phone?: string;
    mapEmbedUrl?: string;
    instagramUrl?: string;
  }): Promise<VenueInfo> => {
    const { data } = await api.put("/venue", venue);
    return data;
  },

  // Splash photo
  getSplashPhoto: async (): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const { data } = await api.get("/splash");
    return data;
  },

  uploadSplashPhoto: async (
    file: File,
    objectPosition?: string,
  ): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const form = new FormData();
    form.append("image", file);
    if (objectPosition) form.append("objectPosition", objectPosition);
    const { data } = await api.post("/splash", form);
    return data;
  },

  updateSplashPhotoPosition: async (
    objectPosition: string,
  ): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const { data } = await api.put("/splash/position", { objectPosition });
    return data;
  },

  updateSplashPhotoEnabled: async (
    enabled: boolean,
  ): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const { data } = await api.patch("/splash/enabled", { enabled });
    return data;
  },

  deleteSplashPhoto: async (): Promise<{
    image: string | null;
    objectPosition: string;
    enabled: boolean;
  }> => {
    const { data } = await api.delete("/splash");
    return data;
  },

  // Email verification
  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`/verify-email/${token}`);
  },

  resendVerification: async (): Promise<void> => {
    await api.post("/resend-verification");
  },

  // Password recovery
  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(`/reset-password/${token}`, { newPassword });
  },

  // Discounts
  getDiscounts: async (): Promise<Discount[]> => {
    const { data } = await api.get("/discounts");
    return data;
  },

  createDiscount: async (
    discount: Omit<Discount, "_id">,
  ): Promise<Discount> => {
    const { data } = await api.post("/discounts", discount);
    return data;
  },

  updateDiscount: async (
    id: string,
    discount: Partial<Discount>,
  ): Promise<Discount> => {
    const { data } = await api.put(`/discounts/${id}`, discount);
    return data;
  },

  deleteDiscount: async (id: string): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },
};
