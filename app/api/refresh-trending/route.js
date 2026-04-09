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

// Real-looking browser User-Agent — một số feed (SeriousEats, Food & Wine)
// chặn hard nếu UA chứa "bot" hoặc trông như script.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.google.com/",
      },
      cache: "no-store",
      redirect: "follow",
      // Avoid hanging on slow feeds
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { source: source.id, error: `HTTP ${res.status}`, items: [] };
    }
    const xml = await res.text();
    const parsed = parseRss(xml).filter((it) => it.title && it.link);
    const items = parsed.slice(0, ITEMS_PER_SOURCE).map((it) => ({
      ...it,
      source: source.id,
      sourceName: source.name,
      sourceLang: source.lang,
    }));
    if (items.length === 0) {
      return {
        source: source.id,
        error: `parsed 0 items (xml ${xml.length} bytes)`,
        items: [],
      };
    }
    return { source: source.id, items };
  } catch (err) {
    return { source: source.id, error: String(err?.message || err), items: [] };
  }
}

// ---------------------------------------------------------------------------
// Groq — rewrite each item into a FULL Vietnamese food-journalism article
// ---------------------------------------------------------------------------
//
// Mỗi bài raw (title + description + content) sẽ được gửi lên Groq
// với system prompt "bạn là phóng viên ẩm thực cao cấp của B'My".
// Output là JSON có 4 trường:
//   titleVi   - tiêu đề tiếng Việt 10-14 chữ, có gu, không clickbait
//   leadVi    - đoạn mở 2-3 câu để hook người đọc
//   bodyVi    - nội dung đầy đủ 400-600 chữ, markdown với ## subheads
//   tags      - 2-4 tag ngắn
//
// NGUYÊN TẮC:
//   - Không copy trực tiếp bất cứ câu nào từ nguồn.
//   - Không dịch máy kiểu Google Translate.
//   - Viết như 1 phóng viên ẩm thực thực thụ: có góc nhìn, có chi tiết
//     cảm quan, liên hệ với văn hoá ẩm thực Việt Nam nếu có thể.
//   - Phải tự nhiên đến mức đọc xong người Việt không nhận ra là dịch.

const JOURNALIST_SYSTEM_PROMPT = `Bạn là phóng viên ẩm thực cao cấp của B'My Kitchen – một thương hiệu Bánh Mì và Cà Phê Việt Nam tại Madrid. Bạn viết tiếng Việt tự nhiên, có chiều sâu, có quan điểm, giống như biên tập viên của Esquire hoặc Luxuo Việt Nam. Bạn KHÔNG dịch máy. Bạn ĐỌC nguồn, NẮM ý chính, rồi VIẾT LẠI HOÀN TOÀN bằng giọng văn của mình, có thêm góc nhìn và liên hệ với ẩm thực Việt khi phù hợp. Luôn trả về JSON hợp lệ.`;

// Sanitize input để tránh các ký tự bẻ gãy prompt / JSON của Groq.
// Thay smart-quotes → ASCII, bỏ zero-width & control chars.
function sanitizeForPrompt(s = "") {
  return String(s)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Strip ASCII control chars (keep \n\r\t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

async function groqRewriteOne(item, attempt = 1) {
  if (!GROQ_API_KEY) return { ok: false, stage: "no-key" };

  // Ghép title + description + content để Groq có nhiều ngữ cảnh nhất có thể
  const rawContent = [
    `NGÔN NGỮ NGUỒN: ${item.sourceLang}`,
    `NGUỒN: ${item.sourceName}`,
    `TIÊU ĐỀ GỐC: ${sanitizeForPrompt(item.title)}`,
    `MÔ TẢ: ${sanitizeForPrompt((item.description || "").slice(0, 1500))}`,
    item.content && item.content !== item.description
      ? `NỘI DUNG: ${sanitizeForPrompt(item.content.slice(0, 2500))}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `Dưới đây là tư liệu gốc từ một tạp chí ẩm thực quốc tế. Hãy đọc kỹ rồi VIẾT LẠI HOÀN TOÀN thành một bài báo tiếng Việt của B'My Kitchen.

QUY TẮC BẮT BUỘC:
1. KHÔNG copy bất kỳ câu nào từ tư liệu gốc. Mọi câu phải do bạn viết ra.
2. Tiêu đề (titleVi) 10-14 chữ tiếng Việt, có gu, không clickbait rẻ tiền.
3. Đoạn mở (leadVi) 2-3 câu hook người đọc, nói được vì sao bài này đáng đọc.
4. Nội dung (bodyVi) 400-600 chữ tiếng Việt, chia 2-4 phần với ## subheading markdown, có chi tiết cảm quan, có quan điểm, và nếu liên quan thì liên hệ với ẩm thực Việt Nam. KHÔNG lặp lại tiêu đề hay đoạn mở.
5. Tags: 2-4 tag ngắn bằng tiếng Việt, ví dụ "Bánh mì", "Xu hướng", "Công thức", "Cà phê", "Văn hoá".
6. Nếu nguồn viết về kỹ thuật nấu, hãy giải thích bằng ngôn ngữ dễ hiểu cho độc giả gia đình.
7. Không mở đầu bằng "Theo tạp chí X…" hoặc "Bài viết nói rằng…". Viết như thể bạn tự khám phá ra câu chuyện này.
8. Nếu tư liệu gốc quá ngắn (chỉ có tiêu đề), hãy DỰA VÀO chủ đề để viết ra một bài phân tích / bối cảnh văn hoá ẩm thực liên quan, vẫn đủ 400-600 chữ.

ĐỊNH DẠNG OUTPUT (JSON duy nhất, không thêm text):
{
  "titleVi": "…",
  "leadVi": "…",
  "bodyVi": "## Phần 1\\n\\nNội dung…\\n\\n## Phần 2\\n\\nNội dung…",
  "tags": ["…","…"]
}

TƯ LIỆU GỐC:
${rawContent}`;

  const maxAttempts = 2;
  const retry = async (stage, detail) => {
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return groqRewriteOne(item, attempt + 1);
    }
    return { ok: false, stage, detail, attempts: attempt };
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.6,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: JOURNALIST_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return retry("http", `${res.status} ${body.slice(0, 180)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return retry("parse", content.slice(0, 200));
    }
    if (!parsed.titleVi || !parsed.bodyVi) {
      return retry(
        "validate",
        `keys=${Object.keys(parsed).join(",")} titleVi=${!!parsed.titleVi} bodyVi=${!!parsed.bodyVi}`
      );
    }
    return {
      ok: true,
      titleVi: String(parsed.titleVi).trim(),
      leadVi: String(parsed.leadVi || "").trim(),
      bodyVi: String(parsed.bodyVi).trim(),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
    };
  } catch (err) {
    return retry("exception", String(err?.message || err));
  }
}

// Gọi groqRewriteOne với concurrency limit để không bị rate-limit
async function rewriteAll(items, concurrency = 3) {
  const out = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await groqRewriteOne(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return out;
}

// Build our own proxy URL for an external image so it appears served from
// bmy-app.vercel.app (legally it's a streaming proxy with cache, not a rehost).
function proxyImageUrl(externalUrl) {
  if (!externalUrl) return "";
  try {
    const u = Buffer.from(externalUrl).toString("base64url");
    return `/api/img-proxy?u=${u}`;
  } catch {
    return externalUrl;
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
    return { ok: false, reason: "all feeds empty", errors };
  }

  // 2. Sort by publishedAt desc and cap BEFORE rewriting — chỉ viết lại
  // các bài mới nhất để tiết kiệm token và thời gian.
  raw.sort((a, b) => {
    const da = Date.parse(a.pubDate) || 0;
    const db = Date.parse(b.pubDate) || 0;
    return db - da;
  });
  const toRewrite = raw.slice(0, MAX_TRENDING_ITEMS);

  // 3. Rewrite each item into a full Vietnamese article via Groq.
  //    Concurrency=3 để không bị rate-limit nhưng vẫn nhanh.
  // Concurrency 5 giữ tổng thời gian < 45s cho 12 bài, không vượt Groq rate limit.
  const rewrites = await rewriteAll(toRewrite, 5);

  // 4. Merge — nếu Groq rewrite fail thì fallback về title gốc + excerpt thô.
  let engine = "raw";
  const rewriteErrors = [];
  const articles = toRewrite.map((src, i) => {
    const rw = rewrites[i];
    const id = `${src.source}-${Buffer.from(src.link)
      .toString("base64url")
      .slice(0, 16)}`;
    const baseImage = src.image || "";
    const ok = rw && rw.ok;
    if (ok) engine = "groq";
    if (rw && !rw.ok) {
      rewriteErrors.push({
        i,
        source: src.source,
        title: src.title.slice(0, 60),
        stage: rw.stage,
        detail: typeof rw.detail === "string" ? rw.detail.slice(0, 200) : rw.detail,
        attempts: rw.attempts,
      });
    }
    return {
      id,
      source: src.source,
      sourceName: src.sourceName,
      sourceUrl: src.link,
      originalTitle: src.title,
      titleVi: ok ? rw.titleVi : src.title,
      leadVi: ok ? rw.leadVi : (src.description || "").slice(0, 240),
      bodyVi: ok ? rw.bodyVi : "",
      excerptVi: ok ? rw.leadVi : (src.description || "").slice(0, 180),
      tags: ok ? rw.tags : [],
      image: baseImage, // URL gốc (để debug / fallback)
      imageProxy: proxyImageUrl(baseImage), // URL qua proxy của mình
      publishedAt: src.pubDate || "",
      fetchedAt: new Date().toISOString(),
      isRewritten: !!ok,
    };
  });

  // 5. Save (unless dry run) — chỉ save những bài đã rewrite thành công
  // để Blog không bị lẫn bài tiếng Anh chưa biên tập.
  const publishable = articles.filter((a) => a.isRewritten);
  let saved = null;
  if (!dry) {
    saved = await saveTrending(publishable);
  }

  return {
    ok: true,
    engine,
    count: articles.length,
    publishedCount: publishable.length,
    rewrittenCount: articles.filter((a) => a.isRewritten).length,
    refreshedAt: saved?.refreshedAt || null,
    errors,
    rewriteErrors,
    items: articles,
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
