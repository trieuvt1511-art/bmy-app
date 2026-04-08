"use client";

// useAutoTranslate — a React hook for auto-translating a dict of strings
// to the current UI locale.
//
// Flow:
//   1) On mount and whenever inputs change, read localStorage cache (fast path)
//   2) For any missing entries, POST them to /api/translate in ONE batch
//   3) /api/translate checks Vercel KV (shared) → Google Translate → saves to KV
//   4) Results are written back to localStorage and state
//
// English locale is a no-op passthrough (source is English).
//
// Usage:
//   const { translations, loading } = useAutoTranslate(locale, {
//     title: meal.strMeal,
//     ing_0: "Beef — 500g",
//     instructions: meal.strInstructions,
//   });

import { useEffect, useState } from "react";

// djb2 — tiny sync hash for localStorage keys
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) + h + str.charCodeAt(i);
    h = h | 0;
  }
  return (h >>> 0).toString(36);
}

function lsKey(locale, source) {
  return `yg_t:${locale}:${hash(source)}`;
}

function readCache(locale, source) {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(lsKey(locale, source));
  } catch {
    return null;
  }
}

function writeCache(locale, source, translated) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(lsKey(locale, source), translated);
  } catch {
    // Quota exceeded or storage disabled — ignore
  }
}

export default function useAutoTranslate(locale, texts) {
  // Serialize inputs so the effect re-runs only when content actually changes
  const serialized =
    locale + "|" + JSON.stringify(texts || {});

  const [state, setState] = useState(() => {
    // Initial synchronous state: passthrough for English, otherwise
    // seed from localStorage cache (original text if no cache yet)
    if (!texts) return { translations: {}, loading: false };
    if (locale === "en") return { translations: { ...texts }, loading: false };
    const out = {};
    for (const [k, v] of Object.entries(texts)) {
      const source = String(v || "").trim();
      if (!source) {
        out[k] = "";
        continue;
      }
      out[k] = readCache(locale, source) || source;
    }
    return { translations: out, loading: false };
  });

  useEffect(() => {
    if (!texts || Object.keys(texts).length === 0) {
      setState({ translations: {}, loading: false });
      return;
    }

    if (locale === "en") {
      setState({ translations: { ...texts }, loading: false });
      return;
    }

    // Build current state from localStorage, collect missing keys
    const out = {};
    const missing = {};
    for (const [k, v] of Object.entries(texts)) {
      const source = String(v || "").trim();
      if (!source) {
        out[k] = "";
        continue;
      }
      const cached = readCache(locale, source);
      if (cached) {
        out[k] = cached;
      } else {
        out[k] = source;
        missing[k] = source;
      }
    }

    const missingCount = Object.keys(missing).length;
    setState({ translations: out, loading: missingCount > 0 });

    if (missingCount === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: locale, texts: missing }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        if (data?.translations) {
          const next = { ...out };
          for (const [k, translated] of Object.entries(data.translations)) {
            if (translated && missing[k]) {
              next[k] = translated;
              writeCache(locale, missing[k], translated);
            }
          }
          setState({ translations: next, loading: false });
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  return state;
}
