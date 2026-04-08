"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import RecipeCard from "@/components/RecipeCard";
import Mascot from "@/components/Mascot";

export default function FavoritesPage() {
  const { t } = useI18n();
  const { favorites, clear } = useFavorites();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="bg-gradient-card rounded-3xl p-6 sm:p-10 border border-brand-100">
        <div className="flex items-center gap-2 text-accent-pink font-bold text-sm mb-3">
          <Heart size={18} fill="#FF4D8D" /> {t("nav.favorites")}
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-900">
          {t("favorites.title")} ❤️
        </h1>
        <p className="text-brand-900/70 mt-2 max-w-xl">{t("favorites.subtitle")}</p>

        {favorites.length > 0 && (
          <button
            onClick={clear}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-full text-sm font-bold hover:bg-brand-50"
          >
            <Trash2 size={14} /> {t("favorites.clear")}
          </button>
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Mascot name="study-blue" size={180} floating />
          </div>
          <p className="text-brand-900/60 max-w-md mx-auto mb-6">
            {t("favorites.empty")}
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-full font-bold shadow-lg shadow-brand-500/30 hover:scale-105 transition"
          >
            {t("favorites.browseRecipes")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((m) => (
            <RecipeCard key={m.idMeal} meal={m} />
          ))}
        </div>
      )}
    </section>
  );
}
