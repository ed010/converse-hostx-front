/** UI and API language code for Armenian — always `am`, never `hy`. */
export function normalizeLanguageCode(
  lang?: string | null,
  fallback = "am"
): string {
  const raw = (lang ?? fallback).trim().toLowerCase();
  if (raw === "hy" || raw === "am") {
    return "am";
  }
  if (raw === "en" || raw === "ru") {
    return raw;
  }
  return raw || fallback;
}

export function getStoredLanguageCode(fallback = "am"): string {
  return normalizeLanguageCode(localStorage.getItem("lang"), fallback);
}
