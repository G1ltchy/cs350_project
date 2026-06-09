export type Language = "ko" | "en";

const STORAGE_KEY = "nupjuk_language";

export function readStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "ko";
}

export function storeLanguage(language: Language): void {
  localStorage.setItem(STORAGE_KEY, language);
  document.documentElement.lang = language;
}
