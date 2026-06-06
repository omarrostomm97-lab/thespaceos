import type { Lang } from "./i18n";

export function dn(
  item: { name?: string | null; nameAr?: string | null } | null | undefined,
  lang: Lang
): string {
  if (!item) return "";
  return lang === "ar"
    ? (item.nameAr || item.name || "")
    : (item.name || item.nameAr || "");
}
