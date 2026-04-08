"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "yumgo.favorites.v1";

const FavoritesContext = createContext({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  clear: () => {},
});

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch (_) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (_) {}
  }, [favorites, hydrated]);

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.idMeal === id),
    [favorites]
  );

  const toggleFavorite = useCallback((meal) => {
    if (!meal || !meal.idMeal) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.idMeal === meal.idMeal);
      if (exists) return prev.filter((f) => f.idMeal !== meal.idMeal);
      const compact = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory || "",
        strArea: meal.strArea || "",
      };
      return [compact, ...prev];
    });
  }, []);

  const clear = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clear }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
