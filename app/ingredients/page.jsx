"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Leaf } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { getAllIngredients, ingredientImage } from "@/lib/api";
import useAutoTranslate from "@/lib/useAutoTranslate";

export default function IngredientsPage() {
  const { t, locale } = useI18n();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await getAllIngredients();
      setIngredients(list);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((i) => i.strIngredient?.toLowerCase().includes(q));
  }, [ingredients, query]);

  // Batch-translate the first 120 visible ingredient names + descriptions.
  // Each unique English term is cached in KV, so across all users each
  // ingredient is translated exactly once per language, forever.
  const visible = useMemo(() => filtered.slice(0, 120), [filtered]);
  const textsToTranslate = useMemo(() => {
    const dict = {};
    visible.forEach((ing) => {
      if (ing.strIngredient) {
        dict[`name_${ing.idIngredient}`] = ing.strIngredient;
      }
      if (ing.strDescription) {
        // Keep descriptions short — first sentence only to minimize translation
        const firstSentence = ing.strDescription.split(".")[0].trim();
        if (firstSentence) {
          dict[`desc_${ing.idIngredient}`] = firstSentence;
        }
      }
    });
    return dict;
  }, [visible]);

  const { translations } = useAutoTranslate(locale, textsToTranslate);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="bg-gradient-card rounded-3xl p-6 sm:p-10 border border-brand-100">
        <div className="flex items-center gap-2 text-accent-green font-bold text-sm mb-3">
          <Leaf size={18} /> {t("nav.ingredients")}
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-900">
          {t("ingredients.title")} 🌿
        </h1>
        <p className="text-brand-900/70 mt-2 max-w-xl">
          {t("ingredients.subtitle")}
        </p>

        {/* Search */}
        <div className="mt-6 relative max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ingredients.searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-200 rounded-full text-brand-900 placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mt-10 text-center text-brand-900/60">{t("ingredients.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-brand-900/60">{t("ingredients.empty")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visible.map((ing) => {
            const displayName =
              translations[`name_${ing.idIngredient}`] || ing.strIngredient;
            const displayDesc =
              translations[`desc_${ing.idIngredient}`] || ing.strDescription;
            return (
              <Link
                key={ing.idIngredient}
                href={`/recipes?ingredient=${encodeURIComponent(ing.strIngredient)}`}
                className="card-hover bg-white rounded-3xl border border-brand-100 p-4 text-center"
              >
                <div className="aspect-square rounded-2xl bg-brand-50 flex items-center justify-center overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ingredientImage(ing.strIngredient)}
                    alt={displayName}
                    loading="lazy"
                    className="w-full h-full object-contain p-3"
                    onError={(e) => { e.currentTarget.style.opacity = 0.2; }}
                  />
                </div>
                <div className="font-bold text-brand-900 text-sm line-clamp-1">
                  {displayName}
                </div>
                {displayDesc && (
                  <p className="text-[11px] text-brand-900/50 mt-1 line-clamp-2">
                    {displayDesc}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 120 && (
        <p className="mt-6 text-center text-sm text-brand-900/50">
          Showing first 120 of {filtered.length} — refine your search to see more.
        </p>
      )}
    </section>
  );
}
