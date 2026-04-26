import type { LocalizedString } from "./menu";

export interface AboutImage {
  url: string;
  position: string;
}

export interface AboutBlock {
  _id?: string;
  title: LocalizedString;
  text: LocalizedString;
  images: AboutImage[];
  // Legacy — may be present on old documents
  image?: string;
  imagePosition?: string;
  order?: number;
}
