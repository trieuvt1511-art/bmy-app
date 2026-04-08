"use client";

import Link from "next/link";
import { Sparkles, MapPin, Coffee } from "lucide-react";
import { useI18n } from "./LanguageProvider";
import Mascot from "./Mascot";

export default function BMyPromo() {
  const { t } = useI18n();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        {/* decorative */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent-yellow/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-pink/20 blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-6 p-6 sm:p-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-bold mb-4">
              <Sparkles size={12} /> {t("bmy.tag")}
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight">
              {t("bmy.title")}
            </h2>
            <p className="mt-3 text-white/85 max-w-md">{t("bmy.desc")}</p>

            <div className="mt-5 flex items-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> Madrid
              </span>
              <span className="inline-flex items-center gap-1">
                <Coffee size={14} /> Bánh Mì · Cà Phê
              </span>
            </div>

            <Link
              href="/bmy"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-700 rounded-full font-bold shadow-xl hover:scale-105 transition"
            >
              {t("bmy.cta")} →
            </Link>
          </div>

          {/* Visual: Mascot card */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              {/* decorative halo */}
              <div className="absolute inset-0 bg-accent-yellow rounded-3xl rotate-6 opacity-30" />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent-pink/40 rounded-full blur-2xl" />

              <div className="relative bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 w-72 text-center">
                {/* Mascot — skate jump (năng động nhất) */}
                <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
                  <Mascot name="skate-jump" size={190} floating />
                </div>

                <div className="font-display font-black text-3xl mt-2">B'My</div>
                <div className="text-xs text-white/80 uppercase tracking-wider mt-1">
                  Opening 01·05·2026
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/80">
                  Bánh Mỳ Việt Nam · Cà Phê Việt
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
