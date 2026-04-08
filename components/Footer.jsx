"use client";

import { Heart } from "lucide-react";
import { useI18n } from "./LanguageProvider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-brand-100 bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-brand-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-base text-brand-900">
            Yum<span className="text-brand-500">Go</span>
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-1">
          {t("footer.madeWith")}
          <Heart size={14} className="text-brand-500 mx-1" fill="#FF5722" />
          {t("footer.inMadrid")}
        </div>
        <div>
          {t("footer.dataBy")}{" "}
          <a
            href="https://www.themealdb.com"
            target="_blank"
            rel="noreferrer"
            className="text-brand-500 font-semibold hover:underline"
          >
            TheMealDB
          </a>
        </div>
      </div>
    </footer>
  );
}
