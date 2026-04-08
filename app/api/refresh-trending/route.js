// /api/refresh-trending
//
// Fetches latest posts from food-magazine RSS feeds, uses Groq Llama 3.3 70B
// to write a Vietnamese-language summary in B'My's voice, and saves the
// combined result via trendingStore.
//
// Authentication
// --------------
// Bảo vệ bằng secret header. Vercel Cron sẽ tự động gửi header
//   Authorization: Bearer <CRON_SECRET>
// khi bạn khai báo `vercel.json`. Nếu bạn gọi thủ công thì cũng phải kèm header này.
//
// Usage
// -----
//   GET  /api/refresh-trending?dry=1   → fetch + summarize nhưng không save
//   POST /api/refresh-trending         → fetch + summarize + save
//
// Env
// ---
//   CRON_SECRET     - required (random string, set in Vercel env)
//   GROQ_API_KEY    - required for LLM summaries (falls back to raw excerpt)
//
// Returned JSON:
//   { ok: true, items: [...], count, refreshedAt, engine }

import {
  TRENDING_SOURCES,
  ITEMS_PER_SOURCE,
  MAX_TRENDING_ITEMS,
} from "@/lib/trendingSources";
import { saveTrending } from "@/lib/trendingStore";

// Node runtime — we need full fetch + TextDecoder for RSS parsing.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ---------------------------------------------------------------------------
// RSS parsing — tiny hand-rolled parser, no external deps
// ---------------------------------------------------------------------------

function stripHtml(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? stripHtml(m[1]) : "";
}

function pickAttr(block, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function firstImage(block) {
  // <media:content url="…">
  const m1 = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (m1) return m1[1];
  // <media:thumbnail url="…">
  const m2 = block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
  if (m2) return m2[1];
  // <enclosure url="…">
  const m3 = block.match(
    /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i
  );
  if (m3) return m3[1];
  // first <img src="…"> in description
  const m4 = block.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (m4) return m4[1];
  return "";
}

function parseRss(xml) {
  // RSS 2.0: items inside <item>; Atom: entries inside <entry>
  const blocks = [];
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const b of rssItems) {
    blocks.push({
      title: pick(b, "title"),
      link: pick(b, "link"),
      description: pick(b, "description"),
      content: pick(b, "content:encoded") || pick(b, "content"),
      pubDate: pick(b, "pubDate") || pick(b, "dc:date"),
      image: firstImage(b),
    });
  }
  const atomEntries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of atomEntries) {
    blocks.push({
      title: pick(b, "title"),
      link: pickAttr(b, "link", "href") || pick(b, "link"),
      description: pick(b, "summary") || pick(b, "content"),
      content: pick(b, "content"),
      pubDate: pick(b, "updated") || pick(b, "published"),
      image: firstImage(b),
    });
  }
  return blocks;
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "BMyKitchenBot/1.0 (+https://bmy.es) Mozilla/5.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      cache: "no-store",
      // Avoid hanging on slow feeds
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { source: source.id, error: `HTTP ${res.status}`, items: [] };
    }
    const xml = await res.text();
    const items = parseRss(xml)
      .filter((it) => it.title && it.link)
      .slice(0, ITEMS_PER_SOURCE)
      .map((it) => ({
        ...it,
        source: source.id,
        sourceName: source.name,
        sourceLang: source.lang,
      }));
    return { source: source.id, items };
  } catch (err) {
    return { source: source.id, error: String(err), items: [] };
  }
}

// ---------------------------------------------------------------------------
// Groq — write a Vietnamese-language summary for a batch of items
// ---------------------------------------------------------------------------

async function groqSummarize(items) {
  if (!GROQ_API_KEY || items.length === 0) return null;
  const bullets = items
    .map(
      (it, i) =>
        `[${i + 1}] (${it.sourceLang}) ${it.title}\n   ${it.description.slice(
          0,
          500
        )}`
    )
    .join("\n\n");

  const prompt = `Bạn là biên tập viên ẩm thực của B'My – một thương hiệu bánh mì và cà phê Việt Nam tại Madrid. Nhiệm vụ của bạn là đọc các bài báo ẩm thực sau và viết lại thành các đoạn tóm tắt NGẮN BẰNG TIẾNG VIỆT TỰ NHIÊN (không copy nguyên văn, không dịch máy).

YÊU CẦU:
- Mỗi mục trả về 1 tiêu đề tiếng Việt (title) 8–14 chữ, hấp dẫn, không clickbait rẻ tiền.
- Một đoạn tóm tắt 40–60 chữ (excerpt) giải thích bài nói gì và vì sao người đọc B'My nên quan tâm.
- Một mảng 2–4 tag ngắn (ví dụ: "Công thức", "Xu hướng", "Bánh mì", "Cà phê").
- Trả về ĐÚNG định dạng JSON sau, KHÔNG thêm text khác:

{
  "items": [
    { "index": 1, "title": "…", "excerpt": "…", "tags": ["…","…"] },
    ...
  ]
}

BÀI GỐC:
${bullets}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Bạn là biên tập viên ẩm thực chuyên nghiệp, viết tiếng Việt tự nhiên, súc tích và có gu. Luôn trả về JSON hợp lệ.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return parsed?.items || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function authOk(req) {
  if (!CRON_SECRET) {
    // Nếu chưa set secret thì chỉ cho phép trong dev.
    return process.env.NODE_ENV !== "production";
  }
  const h = req.headers.get("authorization") || "";
  return h === `Bearer ${CRON_SECRET}`;
}

async function run({ dry = false } = {}) {
  // 1. Fetch all feeds in parallel
  const feedResults = await Promise.all(TRENDING_SOURCES.map(fetchFeed));

  const raw = [];
  const errors = [];
  for (const fr of feedResults) {
    if (fr.error) errors.push({ source: fr.source, error: fr.error });
    raw.push(...fr.items);
  }

  if (raw.length === 0) {
    return {
      ok: false,
      reason: "all feeds empty",
      errors,
    };
  }

  // 2. Summarize via Groq (one batch per ~8 items)
  const BATCH = 8;
  const summaries = [];
  let engine = "raw";
  for (let i = 0; i < raw.length; i += BATCH) {
    const slice = raw.slice(i, i + BATCH);
    const sum = await groqSummarize(slice);
    if (sum && Array.isArray(sum)) {
      engine = "groq";
      for (const s of sum) {
        const src = slice[s.index - 1];
        if (!src) continue;
        summaries.push({
          id: `${src.source}-${Buffer.from(src.link).toString("base64url").slice(0, 16)}`,
          source: src.source,
          sourceName: src.sourceName,
          title: src.title,
          titleVi: s.title || src.title,
          excerpt: src.description.slice(0, 260),
          excerptVi: s.excerpt || "",
          url: src.link,
          image: src.image || "",
          publishedAt: src.pubDate || "",
          fetchedAt: new Date().toISOString(),
          tags: Array.isArray(s.tags) ? s.tags.slice(0, 4) : [],
        });
      }
    } else {
      // fallback: no Groq — keep raw excerpt
      for (const src of slice) {
        summaries.push({
          id: `${src.source}-${Buffer.from(src.link).toString("base64url").slice(0, 16)}`,
          source: src.source,
          sourceName: src.sourceName,
          title: src.title,
          titleVi: src.title,
          excerpt: src.description.slice(0, 260),
          excerptVi: "",
          url: src.link,
          image: src.image || "",
          publishedAt: src.pubDate || "",
          fetchedAt: new Date().toISOString(),
          tags: [],
        });
      }
    }
  }

  // 3. Sort by publishedAt desc, cap to MAX
  summaries.sort((a, b) => {
    const da = Date.parse(a.publishedAt) || 0;
    const db = Date.parse(b.publishedAt) || 0;
    return db - da;
  });
  const final = summaries.slice(0, MAX_TRENDING_ITEMS);

  // 4. Save (unless dry run)
  let saved = null;
  if (!dry) {
    saved = await saveTrending(final);
  }

  return {
    ok: true,
    engine,
    count: final.length,
    refreshedAt: saved?.refreshedAt || null,
    errors,
    items: final,
  };
}

export async function GET(req) {
  if (!authOk(req)) return unauthorized();
  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const result = await run({ dry });
  return Response.json(result);
}

export async function POST(req) {
  if (!authOk(req)) return unauthorized();
  const result = await run({ dry: false });
  return Response.json(result);
}
