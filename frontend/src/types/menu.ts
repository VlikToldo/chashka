export interface LocalizedString {
  uk: string;
  en: string;
  es: string;
}

export interface PublicSection {
  _id: string;
  name: LocalizedString;
  category: "food" | "drinks";
  order?: number;
}

export interface MenuItem {
  _id?: string;
  sectionId: string;
  name: LocalizedString;
  price: string;
  ingredients?: LocalizedString;
  allergens?: LocalizedString;
  yield?: LocalizedString;
  image?: string;
  isExtra?: boolean;
}
