"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles, Globe2, Smartphone, Leaf } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import RecipeCard from "@/components/RecipeCard";
import BMyPromo from "@/components/BMyPromo";
import { getTrendingMeals, getCategories } from "@/lib/api";
import useAutoTranslate from "@/lib/useAutoTranslate";

const REGIONS = [
  { name: "Vietnamese", flag: "🇻🇳", color: "from-red-500 to-yellow-500" },
  { name: "Italian",    flag: "🇮🇹", color: "from-green-500 to-red-500" },
  { name: "Spanish",    flag: "🇪🇸", color: "from-red-500 to-yellow-400" },
  { name: "Japanese",   flag: "🇯🇵", color: "from-red-500 to-white" },
  { name: "Thai",       flag: "🇹🇭", color: "from-blue-500 to-red-500" },
  { name: "French",     flag: "🇫🇷", color: "from-blue-500 to-red-500" },
  { name: "Chinese",    flag: "🇨🇳", color: "from-red-500 to-yellow-400" },
  { name: "Indian",     flag: "🇮🇳", color: "from-orange-500 to-green-500" },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [m, c] = await Promise.all([getTrendingMeals(8), getCategories()]);
      setMeals(m);
      setCategories(c.slice(0, 10));
      setLoading(false);
    })();
  }, []);

  // Batch-translate all meal titles + category names in ONE API call.
  const textsToTranslate = useMemo(() => {
    const dict = {};
    meals.forEach((m) => {
      if (m.strMeal) dict[`meal_${m.idMeal}`] = m.strMeal;
    });
    categories.forEach((c) => {
      if (c.strCategory) dict[`cat_${c.idCategory}`] = c.strCategory;
    });
    return dict;
  }, [meals, categories]);

  const { translations } = useAutoTranslate(locale, textsToTranslate);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.2),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs font-bold mb-6 animate-fade-in">
            <Sparkles size={14} />
            {t("tagline")}
          </div>
          <h1 className="font-display font-black text-5xl sm:text-7xl leading-[0.95] max-w-3xl animate-slide-up">
            {t("home.heroTitle")} 🍳
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-2xl text-white/90 animate-slide-up">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-slide-up">
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-600 rounded-full font-bold shadow-xl hover:scale-105 transition"
            >
              {t("home.ctaExplore")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/ingredients"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white rounded-full font-bold border border-white/40 hover:bg-white/30 transition"
            >
              {t("home.ctaRecipes")}
            </Link>
          </div>
        </div>
        {/* Wave separator */}
        <svg className="relative block w-full h-12" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#fffbf8" d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,60 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* TRENDING */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900">
              {t("home.trendingTitle")}
            </h2>
            <p className="text-brand-900/60 mt-1">{t("home.trendingDesc")}</p>
          </div>
          <Link
            href="/recipes"
            className="hidden sm:inline-flex items-center gap-1 text-brand-500 font-semibold hover:gap-2 transition-all"
          >
            {t("home.ctaExplore")} <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-brand-100/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meals.map((m) => (
              <RecipeCard
                key={m.idMeal}
                meal={m}
                titleOverride={translations[`meal_${m.idMeal}`]}
              />
            ))}
          </div>
        )}
      </section>

      {/* REGIONS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900">
          {t("regions.title")}
        </h2>
        <p className="text-brand-900/60 mt-1 mb-6">{t("regions.desc")}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REGIONS.map((r) => (
            <Link
              key={r.name}
              href={`/recipes?area=${encodeURIComponent(r.name)}`}
              className={`card-hover relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${r.color} shadow-lg`}
            >
              <div className="text-4xl mb-2">{r.flag}</div>
              <div className="font-display font-black text-xl drop-shadow">{r.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* B'My promo */}
      <BMyPromo />

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900">
          {t("home.categoriesTitle")}
        </h2>
        <p className="text-brand-900/60 mt-1 mb-6">{t("home.categoriesDesc")}</p>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {categories.map((cat, idx) => {
            const gradients = [
              "from-rose-400 to-orange-400",
              "from-amber-400 to-pink-500",
              "from-emerald-400 to-teal-500",
              "from-sky-400 to-indigo-500",
              "from-fuchsia-400 to-purple-500",
              "from-lime-400 to-emerald-500",
              "from-orange-400 to-red-500",
              "from-cyan-400 to-blue-500",
              "from-yellow-400 to-orange-500",
              "from-pink-400 to-rose-500",
            ];
            const hasRemoteThumb =
              typeof cat.strCategoryThumb === "string" &&
              cat.strCategoryThumb.startsWith("http");
            const label =
              translations[`cat_${cat.idCategory}`] || cat.strCategory;
            const initial = String(label || "?").charAt(0).toUpperCase();
            return (
              <Link
                key={cat.idCategory}
                href={`/recipes?category=${encodeURIComponent(cat.strCategory)}`}
                className="flex-shrink-0 w-40 bg-white border border-brand-100 rounded-3xl p-3 card-hover"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-2 bg-brand-50">
                  {hasRemoteThumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.strCategoryThumb}
                      alt={cat.strCategory}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center`}
                    >
                      <span className="font-display font-black text-white text-6xl drop-shadow-md">
                        {initial}
                      </span>
                    </div>
                  )}
                </div>
                <div className="font-bold text-brand-900 text-sm">{label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900 text-center">
          {t("home.featuresTitle")}
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {[
            { Icon: Globe2, title: "home.feature1Title", desc: "home.feature1Desc", color: "bg-accent-pink" },
            { Icon: Leaf, title: "home.feature2Title", desc: "home.feature2Desc", color: "bg-accent-green" },
            { Icon: Smartphone, title: "home.feature3Title", desc: "home.feature3Desc", color: "bg-accent-purple" },
          ].map(({ Icon, title, desc, color }, i) => (
            <div
              key={i}
              className="bg-white border border-brand-100 rounded-3xl p-6 card-hover"
            >
              <div className={`w-12 h-12 ${color} rounded-2xl text-white flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-xl text-brand-900 mb-2">
                {t(title)}
              </h3>
              <p className="text-brand-900/70 text-sm">{t(desc)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
