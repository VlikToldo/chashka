import type { LocalizedString } from "./menu";

export interface AdminUser {
  _id: string;
  email: string;
  emailVerified?: boolean;
}

export interface AdminProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

export interface VenueInfo {
  address: LocalizedString;
  phone: string;
  mapEmbedUrl?: string;
  instagramUrl?: string;
}

export interface Section {
  _id?: string;
  name: LocalizedString;
  category: "food" | "drinks";
  order?: number;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Нд",
};

export const ALL_DAYS: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export interface TimeSlot {
  id: string;
  days: DayKey[];
  openTime: string;
  closeTime: string;
}

export interface AdminMenuItem {
  _id?: string;
  sectionId: string;
  name: LocalizedString;
  price: string;
  ingredients: LocalizedString;
  allergens: LocalizedString;
  yield: LocalizedString;
  image?: string;
  isExtra?: boolean;
}
