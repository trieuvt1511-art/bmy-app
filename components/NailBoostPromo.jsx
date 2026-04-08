"use client";

import Link from "next/link";
import { Sparkles, Users, Smartphone, TrendingUp } from "lucide-react";
import { useI18n } from "./LanguageProvider";

export default function NailBoostPromo() {
  const { t } = useI18n();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-brand-100 dark:border-neutral-800 bg-gradient-to-br from-purple-700 via-pink-600 to-fuchsia-500 text-white">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-6 p-6 sm:p-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-bold mb-4">
              <Sparkles size={12} /> {t("nailboost.tag")}
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight">
              {t("nailboost.title")}
            </h2>
            <p className="mt-3 text-white/85 max-w-md">{t("nailboost.desc")}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1">
                <Users size={14} /> {t("nailboost.feat1")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Smartphone size={14} /> {t("nailboost.feat2")}
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp size={14} /> {t("nailboost.feat3")}
              </span>
            </div>

            <Link
              href="/nailboost"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-white text-fuchsia-700 rounded-full font-bold shadow-xl hover:scale-105 transition"
            >
              {t("nailboost.cta")} →
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-300 rounded-3xl -rotate-6 opacity-30" />
              <div className="relative bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 w-64 text-center">
                <div className="text-6xl mb-2">💅📱</div>
                <div className="font-display font-black text-2xl">NailBoost</div>
                <div className="text-xs text-white/70 uppercase tracking-wider mt-1">
                  For Vietnamese Nail Pros in EU
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/80">
                  Booking · Customer · Revenue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
