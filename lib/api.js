// Hybrid data layer for B'My:
//   - BMY_RECIPES (curated 24 Vietnamese dishes, always shown first)
//   - TheMealDB public API (for variety + search beyond Vietnamese cuisine)
//
// TheMealDB docs: https://www.themealdb.com/api.php
// Free test key "1" — enough for a prototype / learning app.

import { BMY_RECIPES, getBmyRecipeById } from "./bmyRecipes";

const BASE = "https://www.themealdb.com/api/json/v1/1";

async function safeFetch(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

// ------------------------------------------------------------------
// TRENDING — always surface B'My Vietnamese recipes first
// ------------------------------------------------------------------
export async function getTrendingMeals(count = 8) {
  const localCount = Math.min(count, BMY_RECIPES.length);
  const local = BMY_RECIPES.slice(0, localCount);
  if (localCount >= count) return local;

  const remote = Math.max(0, count - localCount);
  const promises = Array.from({ length: remote }, () =>
    safeFetch(`${BASE}/random.php`)
  );
  const results = await Promise.all(promises);
  const meals = results
    .map((r) => (r && r.meals ? r.meals[0] : null))
    .filter(Boolean);
  const seen = new Set(local.map((m) => m.idMeal));
  const uniq = meals.filter((m) => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });
  return [...local, ...uniq];
}

// All BMY recipes (used by /recipes page as primary list)
export function getAllBmyRecipes() {
  return BMY_RECIPES;
}

// SVG data-URL placeholder cho category thiếu thumbnail.
// Lặp palette theo index để mỗi category 1 màu khác nhau.
const CAT_PALETTES = [
  ["#FF6B35", "#E63946"],
  ["#F4A261", "#E76F51"],
  ["#2A9D8F", "#264653"],
  ["#FFB703", "#FB8500"],
  ["#E07A5F", "#81B29A"],
  ["#8E44AD", "#3498DB"],
];
function catPlaceholder(name, i = 0) {
  const [a, b] = CAT_PALETTES[i % CAT_PALETTES.length];
  const safe = String(name).replace(/[<>&"']/g, "");
  const initial = safe.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><text x="200" y="240" text-anchor="middle" fill="white" font-size="180" font-family="Georgia,serif" font-weight="700">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// All categories (merge BMY + TheMealDB)
export async function getCategories() {
  const data = await safeFetch(`${BASE}/categories.php`);
  const remote = data?.categories || [];
  const bmyCategories = [...new Set(BMY_RECIPES.map((r) => r.strCategory))];
  const existing = new Set(remote.map((c) => c.strCategory));
  const extras = bmyCategories
    .filter((c) => !existing.has(c))
    .map((c, i) => ({
      idCategory: `bmy-${c}`,
      strCategory: c,
      strCategoryThumb: catPlaceholder(c, i),
      strCategoryDescription: `Các món ${c.toLowerCase()} Việt Nam đặc trưng.`,
    }));
  return [...extras, ...remote];
}

// All ingredients
export async function getAllIngredients() {
  const data = await safeFetch(`${BASE}/list.php?i=list`);
  return data?.meals || [];
}

// Ingredient thumbnail from name
export function ingredientImage(name) {
  const safe = encodeURIComponent(name.trim().replace(/\s+/g, "_"));
  return `https://www.themealdb.com/images/ingredients/${safe}-Medium.png`;
}

// ------------------------------------------------------------------
// SEARCH — BMY first, then TheMealDB
// ------------------------------------------------------------------
export async function searchMeals(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const local = BMY_RECIPES.filter(
    (r) =>
      r.strMeal.toLowerCase().includes(q) ||
      (r.strMealVi || "").toLowerCase().includes(q) ||
      r.strCategory.toLowerCase().includes(q)
  );
  const data = await safeFetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const remote = data?.meals || [];
  const seen = new Set(local.map((m) => m.idMeal));
  const deduped = remote.filter((m) => !seen.has(m.idMeal));
  return [...local, ...deduped];
}

// ------------------------------------------------------------------
// FILTER BY CATEGORY
// ------------------------------------------------------------------
export async function filterByCategory(category) {
  const local = BMY_RECIPES.filter(
    (r) => r.strCategory.toLowerCase() === String(category).toLowerCase()
  );
  const data = await safeFetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const remote = data?.meals || [];
  const seen = new Set(local.map((m) => m.idMeal));
  const deduped = remote.filter((m) => !seen.has(m.idMeal));
  return [...local, ...deduped];
}

// ------------------------------------------------------------------
// FILTER BY AREA
// ------------------------------------------------------------------
export async function filterByArea(area) {
  const localIsVn = String(area).toLowerCase() === "vietnamese";
  const local = localIsVn ? BMY_RECIPES : [];
  const data = await safeFetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  const remote = data?.meals || [];
  const seen = new Set(local.map((m) => m.idMeal));
  const deduped = remote.filter((m) => !seen.has(m.idMeal));
  return [...local, ...deduped];
}

// ------------------------------------------------------------------
// LOOKUP BY ID — short-circuit for BMY ids
// ------------------------------------------------------------------
export async function getMealById(id) {
  if (typeof id === "string" && id.startsWith("bmy-")) {
    return getBmyRecipeById(id);
  }
  const data = await safeFetch(`${BASE}/lookup.php?i=${id}`);
  return data?.meals?.[0] || null;
}

// Helper: turn a meal detail into [{ingredient, measure}]
export function extractIngredients(meal) {
  if (!meal) return [];
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const mea = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      list.push({ ingredient: ing.trim(), measure: (mea || "").trim() });
    }
  }
  return list;
}
