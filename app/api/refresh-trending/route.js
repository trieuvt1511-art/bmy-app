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

import crypto from "node:crypto";
import {
  TRENDING_SOURCES,
  ITEMS_PER_SOURCE,
  MAX_TRENDING_ITEMS,
} from "@/lib/trendingSources";
import { saveTrending, getTrending } from "@/lib/trendingStore";

// Stable, collision-free id từ source + URL.
// Bug cũ: slice(0, 16) base64url của URL → mọi URL bắt đầu bằng "https://www."
// đều có 16 ký tự đầu giống nhau ("aHR0cHM6Ly93d3cu") → collision giữa các bài
// cùng host. SHA-1 tránh hoàn toàn collision này.
function makeArticleId(source, url) {
  const hash = crypto.createHash("sha1").update(url || "").digest("hex").slice(0, 12);
  return `${source}-${hash}`;
}

// Incremental rewrite cap: mỗi lần cron chỉ rewrite bấy nhiêu item MỚI.
// Groq free tier 8b-instant TPM ~6000, mỗi rewrite ~2500 token → 2 calls/run an toàn.
// Sau ~4-6h cron chạy định kỳ sẽ tích đủ MAX_TRENDING_ITEMS item cache.
const MAX_REWRITES_PER_RUN = 2;

// Node runtime — we need full fetch + TextDecoder for RSS parsing.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
// llama-3.3-70b-versatile: chất lượng tiếng Việt tốt hơn 8b rõ rệt, ít Vinglish.
// TPM free tier ~6000. Với MAX_REWRITES_PER_RUN=2 × ~1250 token/call = ~2500 TPM/run,
// vẫn fit thoải mái. Sequential (concurrency=1) nên không đụng rate limit.
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

const JOURNALIST_SYSTEM_PROMPT = `Bạn là biên tập viên ẩm thực tiếng Việt cao cấp, viết cho mục Đời Sống của VnExpress và mục Ẩm Thực của Luxuo Việt Nam. Bạn viết như một người Việt bản xứ đã sống nhiều năm ở châu Âu, am hiểu cả ẩm thực Việt lẫn ẩm thực quốc tế. Văn phong: điềm đạm, có chiều sâu, có quan điểm cá nhân, không màu mè, không clickbait.

QUY TẮC TIẾNG VIỆT TUYỆT ĐỐI (quan trọng nhất):
1. DỊCH 100% SANG TIẾNG VIỆT. Tuyệt đối KHÔNG để bất kỳ từ tiếng Anh, tiếng Pháp, hay tiếng Tây Ban Nha nào trong titleVi, leadVi, bodyVi. Mọi từ phải là tiếng Việt.
2. CẤM các từ loanword sau đây — phải dịch ra tiếng Việt:
   - "kitchen" → "căn bếp" / "gian bếp"
   - "energie" / "energy" → "năng lượng"
   - "salade" / "salad" → "gỏi" hoặc "rau trộn"
   - "grocery" → "cửa hàng thực phẩm" / "tạp hoá"
   - "creamy" → "béo ngậy" / "mềm mịn"
   - "chef" → "đầu bếp"
   - "dessert" → "món tráng miệng"
   - "spicy" → "cay"
   - "menu" → "thực đơn"
   - "recipe" → "công thức"
   - "trending" → "xu hướng"
   - "guide" → "cẩm nang" / "hướng dẫn"
   - "fresh" → "tươi"
3. CẤM viết hoa kiểu tiếng Anh ("Món Ăn Mới Của Martha Stewart"). Tiếng Việt chỉ viết hoa CHỮ CÁI ĐẦU CÂU và TÊN RIÊNG. Ví dụ ĐÚNG: "Martha Stewart gợi ý món gì cho mùa xuân".
4. Tên riêng nước ngoài (người, thương hiệu, địa danh) giữ nguyên. Ví dụ: Gabriela Cámara, Michelin Guide, Bon Appétit, Tokyo.
5. Tên món ăn: nếu món Việt thì viết tiếng Việt (bánh mì, phở, gỏi cuốn). Nếu món nước ngoài đã quen thuộc thì giữ nguyên nhưng in nghiêng nếu dài (risotto, gimbap, tiramisu). Nếu lạ thì mở ngoặc giải thích ngắn.

VĂN PHONG — viết như người viết báo Việt Nam thật:
- Câu chủ động, ngắn gọn. Tránh "được", "bởi", "đối với" lặp lại.
- Không dùng "rất", "cực kỳ", "vô cùng" trừ khi thực sự cần.
- Không mở bài bằng câu hỏi tu từ rẻ tiền ("Bạn đã bao giờ...?").
- Không kết bài bằng câu khẩu hiệu quảng cáo.
- Có thể liên hệ với ẩm thực Việt khi phù hợp, nhưng đừng gượng ép.
- Kể chi tiết cảm quan (mùi, vị, kết cấu) thay vì chỉ miêu tả trừu tượng.

TIÊU ĐỀ (titleVi) — quan trọng:
- 8 đến 14 chữ tiếng Việt. Không clickbait, không "bí kíp", "bí mật", không dấu chấm than.
- Viết hoa theo chuẩn tiếng Việt (chỉ chữ đầu + tên riêng).
- Ví dụ TỐT: "Gabriela Cámara và căn bếp Mexico giữa lòng New York"
- Ví dụ XẤU: "Kitchen Của Đầu Bếp Gabriela Cámara - Một Cánh Cổng..."

Luôn trả về JSON hợp lệ, không có text nào ngoài JSON.`;

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

  // Ghép title + description + content. Giới hạn chặt để tiết kiệm TPM
  // (free tier 8b-instant chỉ 6000 TPM).
  const rawContent = [
    `NGÔN NGỮ NGUỒN: ${item.sourceLang}`,
    `NGUỒN: ${item.sourceName}`,
    `TIÊU ĐỀ GỐC: ${sanitizeForPrompt(item.title)}`,
    `MÔ TẢ: ${sanitizeForPrompt((item.description || "").slice(0, 500))}`,
    item.content && item.content !== item.description
      ? `NỘI DUNG: ${sanitizeForPrompt(item.content.slice(0, 800))}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `Đọc kỹ tư liệu gốc bên dưới rồi VIẾT LẠI HOÀN TOÀN thành một bài báo tiếng Việt thuần. Nhớ các quy tắc tiếng Việt trong system prompt.

YÊU CẦU CỤ THỂ:
1. KHÔNG copy bất kỳ cụm từ nào từ tư liệu gốc.
2. titleVi: 8-14 chữ tiếng Việt, viết hoa đúng chuẩn tiếng Việt (chỉ chữ đầu + tên riêng), không clickbait.
3. leadVi: 2-3 câu tiếng Việt mở bài, giới thiệu chủ đề một cách tự nhiên. Không mở bằng "Theo...", "Bài viết...", hoặc câu hỏi tu từ.
4. bodyVi: 400-600 chữ tiếng Việt, chia 2-4 phần bằng "## Tiêu đề phần" (markdown). Mỗi phần có luận điểm rõ ràng, chi tiết cảm quan, và nếu phù hợp thì liên hệ ẩm thực Việt. KHÔNG lặp lại titleVi hay leadVi.
5. tags: 2-4 tag tiếng Việt ngắn (vd: "Bánh mì", "Xu hướng", "Công thức", "Cà phê", "Văn hoá", "Đầu bếp").
6. Nếu nguồn rất ngắn (chỉ có tiêu đề), tự viết bài phân tích/bối cảnh văn hoá ẩm thực quanh chủ đề đó.

KIỂM TRA TRƯỚC KHI TRẢ:
- Đọc lại titleVi và bodyVi. Nếu còn sót bất kỳ từ tiếng Anh/Pháp/Tây Ban Nha nào (kitchen, salade, energie, creamy, chef, trending, fresh, guide, grocery...), DỊCH NGAY.
- Nếu tiêu đề Viết Hoa Mọi Chữ (kiểu tiếng Anh), SỬA LẠI về chuẩn tiếng Việt.
- Nếu có chữ "rất", "cực kỳ", "vô cùng" lặp lại, gỡ bớt.

ĐỊNH DẠNG OUTPUT (JSON duy nhất, không có text ngoài JSON):
{
  "titleVi": "...",
  "leadVi": "...",
  "bodyVi": "## Phần 1\\n\\nNội dung...\\n\\n## Phần 2\\n\\nNội dung...",
  "tags": ["...","..."]
}

TƯ LIỆU GỐC:
${rawContent}`;

  // Fail-fast: 2 attempts max, backoff phù hợp với maxDuration 60s Hobby.
  // 70b-versatile chậm hơn 8b (~10-18s/call) nên 2 attempts + buffer vừa đủ.
  const maxAttempts = 2;
  const retry = async (stage, detail, is429 = false) => {
    if (attempt < maxAttempts) {
      // 429 TPM reset mỗi 60s, 12s là sweet spot giữa chờ reset và fit 60s maxDuration
      const waitMs = is429 ? 12000 : 2000;
      await new Promise((r) => setTimeout(r, waitMs));
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
        // Nhiệt độ thấp hơn để giảm sáng tạo lung tung + ép tuân thủ prompt nghiêm.
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: JOURNALIST_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      // 70b chậm hơn 8b, cần buffer lớn hơn (trước 18s cho 8b)
      signal: AbortSignal.timeout(28000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return retry("http", `${res.status} ${body.slice(0, 180)}`, res.status === 429);
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

async function run({ dry = false, rewriteAll: forceRewriteAll = false } = {}) {
  // 0. Load existing cache — dùng làm base + skip item đã rewrite trước đó.
  const existing = await getTrending();
  const existingByUrl = new Map(
    existing.map((it) => [it.sourceUrl || it.url || "", it])
  );

  // 1. Fetch all feeds in parallel
  const feedResults = await Promise.all(TRENDING_SOURCES.map(fetchFeed));

  const raw = [];
  const errors = [];
  for (const fr of feedResults) {
    if (fr.error) errors.push({ source: fr.source, error: fr.error });
    raw.push(...fr.items);
  }

  if (raw.length === 0 && existing.length === 0) {
    return { ok: false, reason: "all feeds empty", errors };
  }

  // 2. Sort by publishedAt desc
  raw.sort((a, b) => {
    const da = Date.parse(a.pubDate) || 0;
    const db = Date.parse(b.pubDate) || 0;
    return db - da;
  });

  // 3. Chọn items để rewrite.
  //    Mặc định: chỉ rewrite items CHƯA có trong cache (incremental).
  //    Chế độ force (?rewrite=all): ưu tiên rewrite items cũ nhất trong cache trước
  //    (những item chưa có bodyVi mới theo prompt cải tiến). Dùng để migrate sau khi
  //    cải prompt hoặc chuyển model.
  let freshRaw;
  if (forceRewriteAll) {
    // Lấy items từ feed match với existing URLs (để re-rewrite cache hiện có),
    // ưu tiên items cũ nhất trong cache (isRewritten=true nhưng prompt outdated).
    // Fallback: cũng rewrite items chưa có trong cache nếu feed có bài mới.
    const rawByUrl = new Map(raw.map((r) => [r.link, r]));
    const staleExisting = existing
      .filter((it) => it.sourceUrl && rawByUrl.has(it.sourceUrl))
      .map((it) => rawByUrl.get(it.sourceUrl));
    const newInFeed = raw.filter((r) => !existingByUrl.has(r.link));
    freshRaw = [...staleExisting, ...newInFeed];
  } else {
    freshRaw = raw.filter((r) => !existingByUrl.has(r.link));
  }
  //    Cap ở MAX_REWRITES_PER_RUN để không vượt TPM free tier.
  const toRewrite = freshRaw.slice(0, MAX_REWRITES_PER_RUN);

  // 4. Rewrite sequential (concurrency=1) — an toàn tuyệt đối với TPM.
  const rewrites = await rewriteAll(toRewrite, 1);

  // 5. Build new article objects.
  let engine = existing.length > 0 ? "groq" : "raw";
  const rewriteErrors = [];
  const newArticles = toRewrite.map((src, i) => {
    const rw = rewrites[i];
    const id = makeArticleId(src.source, src.link);
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
      image: baseImage,
      imageProxy: proxyImageUrl(baseImage),
      publishedAt: src.pubDate || "",
      fetchedAt: new Date().toISOString(),
      isRewritten: !!ok,
    };
  });

  // 6. Merge với cache cũ: new publishable items + existing items,
  //    dedupe by sourceUrl, sort by publishedAt desc, cap MAX_TRENDING_ITEMS.
  //    Đồng thời regenerate id cho mọi existing item dùng SHA-1 scheme mới
  //    để fix bug collision cũ (mọi URL https://www... trùng id).
  const newPublishable = newArticles.filter((a) => a.isRewritten);
  const mergedMap = new Map();
  for (const it of newPublishable) mergedMap.set(it.sourceUrl, it);
  for (const it of existing) {
    const url = it.sourceUrl || it.url || "";
    if (url && !mergedMap.has(url)) {
      // Force regenerate id với scheme mới (SHA-1) để migrate cache cũ.
      mergedMap.set(url, { ...it, id: makeArticleId(it.source, url) });
    }
  }
  const merged = [...mergedMap.values()]
    .sort((a, b) => {
      const da = Date.parse(a.publishedAt || a.fetchedAt) || 0;
      const db = Date.parse(b.publishedAt || b.fetchedAt) || 0;
      return db - da;
    })
    .slice(0, MAX_TRENDING_ITEMS);

  // 7. Save merged cache (unless dry run)
  let saved = null;
  if (!dry) {
    saved = await saveTrending(merged);
  }

  return {
    ok: true,
    engine,
    // Report new activity this run
    attempted: toRewrite.length,
    newlyRewritten: newPublishable.length,
    // Report total cache state after merge
    cachedTotal: merged.length,
    rewriteErrors,
    errors,
    refreshedAt: saved?.refreshedAt || null,
    existingCount: existing.length,
    freshAvailable: freshRaw.length,
  };
}

export async function GET(req) {
  if (!authOk(req)) return unauthorized();
  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const rewriteAll = url.searchParams.get("rewrite") === "all";
  const result = await run({ dry, rewriteAll });
  return Response.json(result);
}

export async function POST(req) {
  if (!authOk(req)) return unauthorized();
  const url = new URL(req.url);
  const rewriteAll = url.searchParams.get("rewrite") === "all";
  const result = await run({ dry: false, rewriteAll });
  return Response.json(result);
}
