"use client";

import Link from "next/link";
import { ChefHat, Heart } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";

export default function RecipeCard({ meal, titleOverride }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  if (!meal) return null;
  const { idMeal, strMeal, strMealThumb, strArea, strCategory } = meal;
  const displayTitle = titleOverride || strMeal;
  const fav = isFavorite(idMeal);

  return (
    <div className="card-hover group relative bg-white rounded-3xl overflow-hidden border border-brand-100 shadow-sm">
      <Link href={`/recipes/${idMeal}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={strMealThumb}
            alt={displayTitle}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {strCategory && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-full text-brand-600">
              {strCategory}
            </span>
          )}
        </div>
        <div className="p-4 pr-12">
          <h3 className="font-display font-bold text-lg text-brand-900 leading-tight line-clamp-2">
            {displayTitle}
          </h3>
          {strArea && (
            <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
              <ChefHat size={14} />
              {strArea}
            </div>
          )}
        </div>
      </Link>

      {/* Heart button (on top, outside link to avoid nested click) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(meal);
        }}
        aria-label="Favorite"
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur transition-all ${
          fav
            ? "bg-brand-500 text-white scale-110"
            : "bg-white/90 text-brand-500 hover:scale-110"
        }`}
      >
        <Heart size={16} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
