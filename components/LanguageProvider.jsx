"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LOCALES, DEFAULT_LOCALE, translations } from "@/lib/i18n";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (path) => path,
});

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("yumgo.locale") : null;
      if (saved && LOCALES.includes(saved)) {
        setLocaleState(saved);
      } else {
        // fall back to browser language if supported
        const nav = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : null;
        if (nav && LOCALES.includes(nav)) setLocaleState(nav);
      }
    } catch (_) {}
  }, []);

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    try { window.localStorage.setItem("yumgo.locale", next); } catch (_) {}
  }, []);

  const t = useCallback(
    (path) => {
      const dict = translations[locale] || translations[DEFAULT_LOCALE];
      return path.split(".").reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : path),
        dict
      );
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}
