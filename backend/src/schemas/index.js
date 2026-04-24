import { z } from "zod";

const multilingualString = (required = false) => {
  const plain = required ? z.string().min(1) : z.string();
  const obj = z.object({
    uk: z.string().optional(),
    en: z.string().optional(),
    es: z.string().optional(),
  });
  return required ? z.union([plain, obj]) : z.union([plain, obj]).optional();
};

// Auth
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  secretCode: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Profile
export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// Sections
export const createSectionSchema = z.object({
  name: multilingualString(true),
  category: z.enum(["food", "drinks"]).optional(),
  order: z.number().optional(),
});

export const updateSectionSchema = z.object({
  name: multilingualString(false),
  category: z.enum(["food", "drinks"]).optional(),
  order: z.number().optional(),
});

// Menu items
export const createMenuItemSchema = z.object({
  sectionId: z.string().min(1),
  name: multilingualString(true),
  price: z.string().min(1),
  ingredients: multilingualString(false),
  allergens: multilingualString(false),
  yield: multilingualString(false),
  isExtra: z.boolean().optional(),
  order: z.number().optional(),
});

export const updateMenuItemSchema = z.object({
  sectionId: z.string().optional(),
  name: multilingualString(false),
  price: z.string().optional(),
  ingredients: multilingualString(false),
  allergens: multilingualString(false),
  yield: multilingualString(false),
  isExtra: z.boolean().optional(),
  order: z.number().optional(),
});

// About
export const createAboutSchema = z.object({
  title: multilingualString(true),
  text: multilingualString(true),
  order: z.number().optional(),
});

export const updateAboutSchema = z.object({
  title: multilingualString(false),
  text: multilingualString(false),
  order: z.number().optional(),
});

// Working Hours
export const updateWorkingHoursSchema = z.object({
  slots: z.array(
    z.object({
      id: z.string().min(1),
      days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])),
      openTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
      closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    }),
  ),
});

// Venue
export const updateVenueSchema = z.object({
  address: multilingualString(false),
  phone: z.string().optional(),
});

// Cover Photo
export const updateCoverPhotoPositionSchema = z.object({
  objectPosition: z.string().min(1).max(100), // e.g. "center center", "50% 50%", "left top"
});
