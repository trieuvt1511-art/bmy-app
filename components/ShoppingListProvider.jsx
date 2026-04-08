"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "yumgo.shopping.v1";

// items: [{ id, ingredient, measure, from: [ {mealId, mealName} ], checked }]
const ShoppingContext = createContext({
  items: [],
  totalCount: 0,
  addFromMeal: () => {},
  removeItem: () => {},
  toggleChecked: () => {},
  clear: () => {},
});

function keyOf(ingredient) {
  return ingredient.trim().toLowerCase();
}

export function ShoppingListProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (_) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, [items, hydrated]);

  const addFromMeal = useCallback((meal, ingredientList) => {
    if (!meal || !ingredientList?.length) return;
    setItems((prev) => {
      const next = [...prev];
      ingredientList.forEach(({ ingredient, measure }) => {
        if (!ingredient) return;
        const k = keyOf(ingredient);
        const existing = next.find((i) => keyOf(i.ingredient) === k);
        if (existing) {
          if (measure && !existing.measures.includes(measure)) {
            existing.measures.push(measure);
          }
          if (!existing.from.some((f) => f.mealId === meal.idMeal)) {
            existing.from.push({ mealId: meal.idMeal, mealName: meal.strMeal });
          }
        } else {
          next.push({
            id: `${k}-${Date.now()}`,
            ingredient,
            measures: measure ? [measure] : [],
            from: [{ mealId: meal.idMeal, mealName: meal.strMeal }],
            checked: false,
          });
        }
      });
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleChecked = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <ShoppingContext.Provider
      value={{
        items,
        totalCount: items.length,
        addFromMeal,
        removeItem,
        toggleChecked,
        clear,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingList() {
  return useContext(ShoppingContext);
}
