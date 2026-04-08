// /api/translate — hybrid translation for YumGo
//
// POST body: { target: "vi"|"en"|"es"|"zh", texts: { [key: string]: string } }
// Response:  { target, translations: { [key]: string }, engine: "groq"|"gtx" }
//
// Translation pipeline:
//   1) For each text, check Vercel KV cache (shared across users)
//   2) Collect cache misses
//   3) Translate misses via Groq (Llama 3.3 70B) with culinary glossary context
//      — one batch request per page, returns a JSON dict
//   4) If Groq fails or GROQ_API_KEY is missing, fall back to free Google Translate
//   5) Write new translations into KV cache
//
// Env vars:
//   GROQ_API_KEY        — optional, enables high-quality LLM translation (free signup at console.groq.com)
//   KV_REST_API_URL     — optional, enables shared cache
//   KV_REST_API_TOKEN   — optional, enables shared cache
//
// The endpoint degrades gracefully: no keys → Google Translate only, still works.

import { GLOSSARY, glossaryPromptFor } from "@/lib/culinaryGlossary";

export const runtime = "edge";

const LANG_NAMES = {
  vi: "Vietnamese",
  en: "English",
  es: "Spanish (Castilian, as spoken in Spain)",
  zh: "Simplified Chinese (Mandarin)",
};

const GTX_LANG = { vi: "vi", en: "en", es: "es", zh: "zh-CN" };

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// -----------------------------------------------------------------------------
// Caching helpers (Upstash Redis REST)
// -----------------------------------------------------------------------------

async function sha1(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function kvGet(key) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result ?? null;
  } catch {
    return null;
  }
}

async function kvSet(key, value) {
  if (!KV_URL || !KV_TOKEN) return;
  try {
    await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: value,
    });
  } catch {
    // Ignore cache write failures
  }
}

// -----------------------------------------------------------------------------
// Engine 1: Groq (Llama 3.3 70B) — primary, high quality with culinary context
// -----------------------------------------------------------------------------

async function groqTranslateBatch(texts, target) {
  if (!GROQ_API_KEY) throw new Error("no-groq-key");

  const targetName = LANG_NAMES[target];
  const glossaryLines = glossaryPromptFor(target);
  const glossaryBlock = glossaryLines
    ? `\n\nUse these EXACT translations when the English term appears (case-insensitive):\n${glossaryLines}`
    : "";

  const systemPrompt =
    `You are a professional culinary translator who produces fluent, natural ${targetName} ` +
    `as spoken by native cooks. Translate each English string in the user's JSON object into ` +
    `${targetName}. Rules:\n` +
    `- Output STRICT valid JSON with EXACTLY the same keys as the input.\n` +
    `- Never leave English in the output unless it's a brand name or measurement unit.\n` +
    `- Preserve measurements (500g, 1 tbsp, 2 cups, ½, ¼, etc.).\n` +
    `- Use natural cooking terminology, not literal word-by-word translation.\n` +
    `- For instructions, write as imperative cooking steps the way a cookbook would.\n` +
    `- Do NOT add commentary, markdown, code fences, or any text outside the JSON.` +
    glossaryBlock;

  const userMessage =
    `Translate this JSON to ${targetName}. Keys stay the same, values get translated:\n\n` +
    JSON.stringify(texts, null, 2);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`groq ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("groq: empty content");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("groq: no JSON in response");
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("groq: parsed is not an object");
  }

  // Ensure all expected keys are present; fall back to original for any missing
  const out = {};
  for (const [k, v] of Object.entries(texts)) {
    const translated = parsed[k];
    out[k] = typeof translated === "string" && translated.trim() ? translated : v;
  }
  return out;
}

// -----------------------------------------------------------------------------
// Engine 2: Google Translate unofficial — fallback, free, no key
// -----------------------------------------------------------------------------

async function gtxCall(text, targetCode) {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`gtx ${res.status}`);
  const data = await res.json();
  return (data?.[0] || []).map((s) => s?.[0] || "").join("");
}

async function googleTranslate(text, targetCode) {
  if (!text || !text.trim()) return "";
  const MAX = 4500;
  if (text.length <= MAX) return gtxCall(text, targetCode);
  const chunks = [];
  let current = "";
  for (const line of text.split(/\n/)) {
    if (current.length + line.length + 1 > MAX) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = current ? current + "\n" + line : line;
    }
  }
  if (current) chunks.push(current);
  const out = [];
  for (const c of chunks) out.push(await gtxCall(c, targetCode));
  return out.join("\n");
}

async function googleTranslateBatch(texts, target) {
  const code = GTX_LANG[target];
  const out = {};
  await Promise.all(
    Object.entries(texts).map(async ([key, raw]) => {
      const source = String(raw || "").trim();
      if (!source) {
        out[key] = "";
        return;
      }
      try {
        const translated = await googleTranslate(source, code);
        out[key] = translated || source;
      } catch {
        out[key] = source;
      }
    })
  );
  return out;
}

// -----------------------------------------------------------------------------
// Route handler
// -----------------------------------------------------------------------------

export async function POST(req) {
  try {
    const { target, texts } = await req.json();

    if (!target || !LANG_NAMES[target]) {
      return Response.json({ error: "Invalid target language" }, { status: 400 });
    }
    if (!texts || typeof texts !== "object") {
      return Response.json({ error: "texts must be an object" }, { status: 400 });
    }

    // English is the source — passthrough
    if (target === "en") {
      return Response.json({ target, translations: texts, engine: "none" });
    }

    // 1) Read cache
    const translations = {};
    const missing = {};
    await Promise.all(
      Object.entries(texts).map(async ([key, raw]) => {
        const source = String(raw || "").trim();
        if (!source) {
          translations[key] = "";
          return;
        }
        const hash = await sha1(source);
        const cacheKey = `yumgo:t:${target}:v2:${hash}`;
        const cached = await kvGet(cacheKey);
        if (typeof cached === "string" && cached) {
          translations[key] = cached;
        } else {
          missing[key] = source;
        }
      })
    );

    if (Object.keys(missing).length === 0) {
      return Response.json({ target, translations, engine: "cache" });
    }

    // 2) Translate the missing bits — try Groq first, then Google
    let engine = "gtx";
    let fresh = null;
    try {
      if (GROQ_API_KEY) {
        fresh = await groqTranslateBatch(missing, target);
        engine = "groq";
      }
    } catch (e) {
      // Groq failed — fall through to Google
      fresh = null;
    }
    if (!fresh) {
      fresh = await googleTranslateBatch(missing, target);
      engine = "gtx";
    }

    // 3) Merge into response, write back to cache
    await Promise.all(
      Object.entries(fresh).map(async ([key, translated]) => {
        const source = missing[key];
        const value = translated || source;
        translations[key] = value;
        if (value && value !== source) {
          const hash = await sha1(source);
          await kvSet(`yumgo:t:${target}:v2:${hash}`, value);
        }
      })
    );

    return Response.json({ target, translations, engine });
  } catch (err) {
    return Response.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
