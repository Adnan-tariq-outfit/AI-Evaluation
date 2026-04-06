"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getDirection,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  languageMeta,
  resolveLanguage,
  translate,
  TranslationValues,
} from "../lib/i18n";

type I18nContextValue = {
  language: LanguageCode;
  direction: "ltr" | "rtl";
  setLanguage: (next: LanguageCode) => void;
  t: (key: string, values?: TranslationValues) => string;
  languages: typeof languageMeta;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const fromNavigator = window.navigator.language?.split("-")[0] ?? "en";
    const nextLanguage = resolveLanguage(stored ?? fromNavigator);
    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    // Keep the UI layout locked across locales.
    // This preserves identical spacing/positioning when switching languages.
    document.documentElement.dir = "ltr";
  }, [language]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: string, values?: TranslationValues) => translate(language, key, values),
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      direction: "ltr",
      setLanguage,
      t,
      languages: languageMeta,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
