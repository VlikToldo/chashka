import type { LocalizedString } from "./menu";

export interface AboutBlock {
  _id?: string;
  title: LocalizedString;
  text: LocalizedString;
  image?: string;
  order?: number;
}
