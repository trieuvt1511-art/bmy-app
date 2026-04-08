"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useI18n } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LOCALE_LABELS[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 h-10 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-900 font-semibold text-sm transition"
        aria-label="Language"
      >
        <Globe size={16} />
        <span>{current.short}</span>
        <span className="text-base leading-none">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden animate-fade-in z-50">
          {LOCALES.map((loc) => {
            const L = LOCALE_LABELS[loc];
            const active = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-600" : "text-brand-900 hover:bg-brand-50"
                }`}
              >
                <span className="text-lg">{L.flag}</span>
                <span className="flex-1">{L.name}</span>
                {active && <Check size={16} className="text-brand-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
