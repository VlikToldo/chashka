import type { Lang } from "../i18n/translations";
import type { LocalizedString } from "../types/menu";

export function localize(
  field: LocalizedString | string | undefined,
  lang: Lang,
  fallback = "",
): string {
  if (!field) return fallback;
  if (typeof field === "string") return field;
  return field[lang] || field.es || field.en || field.uk || fallback;
}
