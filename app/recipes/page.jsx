"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen, Leaf, Fish, Sparkles } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import RecipeCard from "@/components/RecipeCard";
import {
  searchMeals,
  filterByCategory,
  filterByArea,
  getCategories,
  getAllBmyRecipes,
} from "@/lib/api";
import useAutoTranslate from "@/lib/useAutoTranslate";

const AREAS = [
  "Vietnamese", "Italian", "Spanish", "French", "Japanese",
  "Thai", "Chinese", "Indian", "Mexican", "American", "British", "Greek",
];

function RecipesInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const categoryParam = params.get("category") || "";
  const ingredientParam = params.get("ingredient") || "";
  const areaParam = params.get("area") || "";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categoryParam);
  const [area, setArea] = useState(areaParam);
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cats = await getCategories();
      setCategories(cats);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let result = [];

      if (ingredientParam) {
        try {
          const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredientParam)}`
          );
          const data = await res.json();
          result = data?.meals || [];
        } catch (_) {
          result = [];
        }
      } else if (query.trim()) {
        result = await searchMeals(query.trim());
      } else if (area) {
        result = await filterByArea(area);
      } else if (category) {
        result = await filterByCategory(category);
      } else {
        // Default view: 24 B'My Vietnamese recipes first, then a batch of
        // TheMealDB favourites for variety.
        const local = getAllBmyRecipes();
        const extra = await searchMeals("a");
        const seen = new Set(local.map((m) => m.idMeal));
        result = [...local, ...(extra || []).filter((m) => !seen.has(m.idMeal))];
      }

      if (!cancelled) {
        setMeals(result || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, category, area, ingredientParam]);

  const title = useMemo(() => {
    if (ingredientParam) return `${t("recipes.title")} · ${ingredientParam}`;
    if (area) return `${t("recipes.title")} · ${area}`;
    if (category) return `${t("recipes.title")} · ${category}`;
    return t("recipes.title");
  }, [area, category, ingredientParam, t]);

  // Batch-translate meal titles + visible category names for the current locale
  const textsToTranslate = useMemo(() => {
    const dict = {};
    meals.slice(0, 40).forEach((m) => {
      if (m.strMeal) dict[`meal_${m.idMeal}`] = m.strMeal;
    });
    categories.forEach((c) => {
      if (c.strCategory) dict[`cat_${c.idCategory}`] = c.strCategory;
    });
    return dict;
  }, [meals, categories]);

  const { translations } = useAutoTranslate(locale, textsToTranslate);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-gradient-card rounded-3xl p-6 sm:p-10 border border-brand-100">
        <div className="flex items-center gap-2 text-brand-500 font-bold text-sm mb-3">
          <BookOpen size={18} /> {t("nav.recipes")}
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-900">
          {title} 👨‍🍳
        </h1>
        <p className="text-brand-900/70 mt-2 max-w-xl">{t("recipes.subtitle")}</p>

        <div className="mt-6 relative max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => {
              setCategory("");
              setArea("");
              setQuery(e.target.value);
            }}
            placeholder={t("recipes.searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-200 rounded-full text-brand-900 placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-sm"
          />
        </div>
      </div>

      {/* Dietary chips - quick filters */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <span className="flex-shrink-0 text-xs font-bold uppercase tracking-wider text-brand-900/50 mr-1">
          {t("dietary.label")}:
        </span>
        {[
          { key: "Vegetarian", label: t("dietary.vegetarian"), Icon: Leaf, color: "from-green-400 to-emerald-500" },
          { key: "Vegan", label: t("dietary.vegan"), Icon: Sparkles, color: "from-lime-400 to-green-500" },
          { key: "Seafood", label: t("dietary.seafood"), Icon: Fish, color: "from-sky-400 to-blue-500" },
        ].map(({ key, label, Icon, color }) => {
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => {
                setQuery("");
                setArea("");
                setCategory(active ? "" : key);
              }}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition ${
                active
                  ? `bg-gradient-to-r ${color} text-white border-transparent shadow-md`
                  : "bg-white border-brand-200 text-brand-900 hover:bg-brand-50"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => {
            setCategory("");
            setArea("");
            setQuery("");
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${
            !category && !area && !query
              ? "bg-brand-500 text-white border-brand-500"
              : "bg-white border-brand-200 text-brand-900 hover:bg-brand-50"
          }`}
        >
          {t("recipes.filterAll")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.idCategory}
            onClick={() => {
              setQuery("");
              setArea("");
              setCategory(cat.strCategory);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${
              category === cat.strCategory
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white border-brand-200 text-brand-900 hover:bg-brand-50"
            }`}
          >
            {translations[`cat_${cat.idCategory}`] || cat.strCategory}
          </button>
        ))}
      </div>

      {/* Region chips */}
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => {
              setQuery("");
              setCategory("");
              setArea(area === a ? "" : a);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition ${
              area === a
                ? "bg-accent-pink text-white border-accent-pink"
                : "bg-white border-brand-200 text-brand-900/80 hover:bg-brand-50"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-brand-100/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : meals.length === 0 ? (
        <p className="mt-10 text-center text-brand-900/60">{t("recipes.empty")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {meals.slice(0, 40).map((m) => (
            <RecipeCard
              key={m.idMeal}
              meal={m}
              titleOverride={translations[`meal_${m.idMeal}`]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-20 text-center text-brand-900/50">
          Loading...
        </div>
      }
    >
      <RecipesInner />
    </Suspense>
  );
}
