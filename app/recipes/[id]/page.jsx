"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Youtube,
  ExternalLink,
  Tag,
  Heart,
  ShoppingCart,
  Check,
  Languages,
} from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import { useShoppingList } from "@/components/ShoppingListProvider";
import { getMealById, extractIngredients, ingredientImage } from "@/lib/api";
import useAutoTranslate from "@/lib/useAutoTranslate";
import { parseInstructionSteps } from "@/lib/parseSteps";

export default function RecipeDetailPage() {
  const { t, locale } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addFromMeal } = useShoppingList();
  const { id } = useParams();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToShopping, setAddedToShopping] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const m = await getMealById(id);
      setMeal(m);
      setLoading(false);
    })();
  }, [id]);

  const originalIngredients = useMemo(
    () => (meal ? extractIngredients(meal) : []),
    [meal]
  );

  // B'My curated recipes ship with hand-written Vietnamese. When locale === "vi"
  // we skip auto-translate and use the original Vietnamese directly — better
  // quality, zero API calls.
  const isBmy = meal?.isBmy === true;
  const useBakedVi = isBmy && locale === "vi";

  // Pre-clean the raw instructions so Groq receives nicely-separated sentences
  // instead of garbage like "STEP 1\nStep 1 text\nSTEP 2\nStep 2 text".
  // Each step on its own line → cleaner translation prompt, fewer wasted tokens.
  const cleanedInstructions = useMemo(() => {
    const raw = useBakedVi && meal?.strInstructionsVi
      ? meal.strInstructionsVi
      : meal?.strInstructions || "";
    if (!raw) return "";
    const parsed = parseInstructionSteps(raw);
    return parsed.length > 0 ? parsed.join("\n") : raw;
  }, [meal, useBakedVi]);

  // Build the dict of texts to auto-translate whenever meal or locale changes.
  // We use stable keys so translations map cleanly back to UI.
  const textsToTranslate = useMemo(() => {
    if (!meal) return {};
    // If we have baked Vietnamese for vi, skip auto-translate altogether.
    if (useBakedVi) return {};
    const dict = {
      title: meal.strMeal || "",
      instructions: cleanedInstructions,
    };
    originalIngredients.forEach((it, i) => {
      dict[`ing_${i}_name`] = it.ingredient || "";
      if (it.measure) dict[`ing_${i}_measure`] = it.measure;
    });
    return dict;
  }, [meal, originalIngredients, cleanedInstructions, useBakedVi]);

  const { translations, loading: translating } = useAutoTranslate(
    locale,
    textsToTranslate
  );

  const displayTitle = useBakedVi
    ? meal?.strMealVi || meal?.strMeal || ""
    : translations.title || meal?.strMeal || "";
  const displayInstructions = useBakedVi
    ? cleanedInstructions
    : translations.instructions || cleanedInstructions || "";

  const displayIngredients = useMemo(() => {
    return originalIngredients.map((it, i) => ({
      ingredient: translations[`ing_${i}_name`] || it.ingredient,
      measure: translations[`ing_${i}_measure`] || it.measure || "",
    }));
  }, [originalIngredients, translations]);

  const steps = useMemo(
    () => parseInstructionSteps(displayInstructions),
    [displayInstructions]
  );

  const videoId = (() => {
    try {
      const url = new URL(meal?.strYoutube || "");
      return url.searchParams.get("v");
    } catch (_) {
      return null;
    }
  })();

  const handleAddToShopping = () => {
    if (!meal) return;
    addFromMeal(meal, originalIngredients);
    setAddedToShopping(true);
    setTimeout(() => setAddedToShopping(false), 1800);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-brand-100 rounded-full" />
          <div className="aspect-[16/9] bg-brand-100 rounded-3xl" />
          <div className="h-8 w-3/4 bg-brand-100 rounded" />
          <div className="h-4 w-full bg-brand-100 rounded" />
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-brand-900/60">{t("recipes.empty")}</p>
        <Link href="/recipes" className="inline-block mt-4 text-brand-500 font-bold">
          {t("recipes.backToList")}
        </Link>
      </div>
    );
  }

  // Show translation indicator when locale ≠ en
  const showTranslatingBadge = locale !== "en" && translating;
  const showTranslatedBadge = locale !== "en" && !translating;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-brand-500 font-bold mb-4 hover:gap-2 transition-all"
      >
        {t("recipes.backToList")}
      </Link>

      {/* Hero image */}
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meal.strMealThumb}
          alt={displayTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
          <div className="flex flex-wrap gap-2 mb-2">
            {meal.strCategory && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold">
                <Tag size={12} className="inline mr-1" />
                {meal.strCategory}
              </span>
            )}
            {meal.strArea && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold">
                <MapPin size={12} className="inline mr-1" />
                {meal.strArea}
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl leading-tight drop-shadow-lg">
            {displayTitle}
          </h1>
        </div>
        {/* Floating favorite button */}
        <button
          onClick={() => toggleFavorite(meal)}
          aria-label="Favorite"
          className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl backdrop-blur transition-all ${
            isFavorite(meal.idMeal)
              ? "bg-brand-500 text-white scale-110"
              : "bg-white/90 text-brand-500 hover:scale-110"
          }`}
        >
          <Heart size={20} fill={isFavorite(meal.idMeal) ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Action bar: translation status + Add to shopping */}
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        {showTranslatingBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-bold animate-pulse">
            <Languages size={14} /> {t("translate.translating")}
          </div>
        )}
        {showTranslatedBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/15 text-accent-green rounded-full text-sm font-bold">
            <Languages size={14} /> {t("translate.translated")}
          </div>
        )}

        <button
          onClick={handleAddToShopping}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition ${
            addedToShopping
              ? "bg-accent-green text-white"
              : "bg-white border border-brand-200 text-brand-600 hover:bg-brand-50"
          }`}
        >
          {addedToShopping ? <Check size={16} /> : <ShoppingCart size={16} />}
          {addedToShopping ? t("shopping.added") : t("shopping.addToList")}
        </button>
      </div>

      {/* Content grid */}
      <div className="mt-8 grid md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <aside className="md:col-span-1">
          <h2 className="font-display font-black text-2xl text-brand-900 mb-4">
            🧺 {t("recipes.ingredientsLabel")}
          </h2>
          <ul className="space-y-2">
            {displayIngredients.map((it, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-2 bg-white border border-brand-100 rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ingredientImage(
                    originalIngredients[i]?.ingredient || it.ingredient
                  )}
                  alt={it.ingredient}
                  loading="lazy"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.opacity = 0.2;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-brand-900 truncate">
                    {it.ingredient}
                  </div>
                  {it.measure && (
                    <div className="text-xs text-brand-900/60">{it.measure}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Steps */}
        <section className="md:col-span-2">
          <h2 className="font-display font-black text-2xl text-brand-900 mb-4">
            👩‍🍳 {t("recipes.stepsLabel")}
          </h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white font-black flex items-center justify-center shadow-md shadow-brand-500/30">
                  {i + 1}
                </div>
                <p className="flex-1 text-brand-900/90 leading-relaxed pt-1.5">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          {/* Video */}
          {videoId && (
            <div className="mt-8">
              <h3 className="font-display font-black text-xl text-brand-900 mb-3 flex items-center gap-2">
                <Youtube className="text-red-500" /> {t("recipes.videoLabel")}
              </h3>
              <div className="aspect-video rounded-2xl overflow-hidden border border-brand-100">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  title={meal.strMeal}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Source */}
          {meal.strSource && (
            <a
              href={meal.strSource}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-brand-500 font-semibold hover:underline"
            >
              <ExternalLink size={16} /> {t("recipes.sourceLabel")}
            </a>
          )}
        </section>
      </div>
    </article>
  );
}
