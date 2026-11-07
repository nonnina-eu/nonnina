"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { landingDictionaries, type LandingDictionary, type LandingLocale } from "@/lib/i18n/landing";

interface LanguageContextValue {
  locale: LandingLocale;
  t: LandingDictionary;
  setLocale: (locale: LandingLocale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "care-copilot.locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>("it");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "de" || saved === "en" || saved === "it") setLocaleState(saved);
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const setLocale = useCallback((next: LandingLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, t: landingDictionaries[locale], setLocale }), [locale, setLocale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanding(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanding must be used inside <LanguageProvider>");
  return ctx;
}
