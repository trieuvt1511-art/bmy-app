// Đọc/ghi trending items.
//
// Trên Vercel, filesystem chỉ đọc — nên production sẽ dùng Vercel KV.
// Khi dev local hoặc self-host, code fallback sẽ đọc/ghi file data/trending.json.
//
// API:
//   getTrending()            → Promise<TrendingItem[]>
//   saveTrending(items)      → Promise<void>
//   getLastRefreshedAt()     → Promise<string | null>
//
// TrendingItem shape:
//   {
//     id, source, sourceName, title, titleVi, excerpt, excerptVi,
//     url, image, publishedAt, fetchedAt, tags
//   }

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "bmy:trending:v1";
const META_KEY = "bmy:trending:refreshed";

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
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: value,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// File fallback — chỉ hoạt động khi chạy ngoài Vercel (local dev, self-host).
async function fileRead() {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const p = path.join(process.cwd(), "data", "trending.json");
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fileWrite(obj) {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "data");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "trending.json"),
      JSON.stringify(obj, null, 2),
      "utf8"
    );
    return true;
  } catch {
    return false;
  }
}

export async function getTrending() {
  // Prefer KV
  const fromKv = await kvGet(KEY);
  if (fromKv) {
    try {
      return JSON.parse(fromKv);
    } catch {
      // fall through
    }
  }
  // File fallback
  const fromFile = await fileRead();
  if (fromFile?.items) return fromFile.items;
  return [];
}

export async function getLastRefreshedAt() {
  const fromKv = await kvGet(META_KEY);
  if (fromKv) return fromKv;
  const fromFile = await fileRead();
  return fromFile?.refreshedAt || null;
}

export async function saveTrending(items) {
  const payload = { items, refreshedAt: new Date().toISOString() };
  const okKv = await kvSet(KEY, JSON.stringify(items));
  if (okKv) {
    await kvSet(META_KEY, payload.refreshedAt);
  }
  // Always also try file, useful in local dev.
  await fileWrite(payload);
  return payload;
}
