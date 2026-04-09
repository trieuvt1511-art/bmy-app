// /api/img-proxy?u=<base64url-of-remote-image-url>
//
// Stream một ảnh từ URL xa qua domain của B'My.
// Không lưu vĩnh viễn — Vercel edge/CDN sẽ cache theo header Cache-Control.
// Mục tiêu: hiển thị hình ảnh bài trending như đang được host trên bmy-app.vercel.app,
// để URL ảnh trên trang /blog/trending/[id] đều ở dạng /api/img-proxy?u=…
//
// Bảo vệ:
//   - Chỉ cho phép host có trong ALLOWED_HOSTS (theo các RSS source đã verify).
//   - Chỉ cho phép content-type là image/*.
//   - Giới hạn kích thước 5 MB để tránh abuse.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Whitelist host — phải khớp với các CDN ảnh mà feed RSS sử dụng.
const ALLOWED_HOSTS = new Set([
  // The Kitchn / Apartment Therapy
  "cdn.apartmenttherapy.info",
  // Bon Appétit (Condé Nast)
  "assets.bonappetit.com",
  "media.bonappetit.com",
  // Eater / Vox Media
  "platform.eater.com",
  "cdn.vox-cdn.com",
  // AFamily / Kenh14 / VCCorp
  "afamilycdn.com",
  "cafefcdn.com",
  "kenh14cdn.com",
  "genknews.genkcdn.vn",
  "sohanews.sohacdn.com",
  // Generic Unsplash / Wikimedia fallback
  "images.unsplash.com",
  "upload.wikimedia.org",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Trả về 1×1 PNG trong suốt khi ảnh hỏng / chặn
const FALLBACK_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=",
  "base64"
);
function fallback() {
  return new Response(FALLBACK_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u");
  if (!u) return fallback();

  let remoteUrl;
  try {
    remoteUrl = Buffer.from(u, "base64url").toString("utf8");
  } catch {
    return fallback();
  }

  let parsed;
  try {
    parsed = new URL(remoteUrl);
  } catch {
    return fallback();
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return fallback();
  }

  const hostOk =
    ALLOWED_HOSTS.has(parsed.hostname) ||
    // Cho phép subdomain của các host đã whitelist (ví dụ *.vox-cdn.com)
    [...ALLOWED_HOSTS].some((h) => parsed.hostname.endsWith("." + h));

  if (!hostOk) return fallback();

  try {
    const res = await fetch(remoteUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
        Referer: parsed.origin,
      },
      cache: "force-cache",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return fallback();

    const ct = res.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) return fallback();

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return fallback();

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        // Cache 1 ngày ở edge, browser 1 giờ — refresh hàng ngày từ cron
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch {
    return fallback();
  }
}
