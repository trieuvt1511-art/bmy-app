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

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB — hero photos từ Condé Nast/Vox thường 3-8 MB

// Trả về 1×1 PNG trong suốt khi ảnh hỏng / chặn
const FALLBACK_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=",
  "base64"
);
function fallback(reason = "unknown") {
  return new Response(FALLBACK_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
      "X-Proxy-Fallback": reason,
    },
  });
}

// Debug response — trả JSON thay vì ảnh khi có ?debug=1
function debugJson(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u");
  const debug = url.searchParams.get("debug") === "1";
  if (!u) return debug ? debugJson({ error: "no-u" }) : fallback("no-u");

  let remoteUrl;
  try {
    remoteUrl = Buffer.from(u, "base64url").toString("utf8");
  } catch {
    return debug ? debugJson({ error: "bad-base64" }) : fallback("bad-base64");
  }

  let parsed;
  try {
    parsed = new URL(remoteUrl);
  } catch {
    return debug ? debugJson({ error: "bad-url", remoteUrl }) : fallback("bad-url");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return debug ? debugJson({ error: "bad-protocol", proto: parsed.protocol }) : fallback("bad-protocol");
  }

  const hostOk =
    ALLOWED_HOSTS.has(parsed.hostname) ||
    // Cho phép subdomain của các host đã whitelist (ví dụ *.vox-cdn.com)
    [...ALLOWED_HOSTS].some((h) => parsed.hostname.endsWith("." + h));

  if (!hostOk) {
    return debug
      ? debugJson({ error: "host-not-allowed", host: parsed.hostname })
      : fallback("host-not-allowed");
  }

  try {
    const res = await fetch(remoteUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        // Một số CDN (Vox, Condé Nast) chỉ trả ảnh nếu Referer là host gốc của trang đăng
        Referer: `https://www.${parsed.hostname.replace(/^platform\./, "").replace(/^assets\./, "").replace(/^media\./, "").replace(/^cdn\./, "")}/`,
      },
      cache: "force-cache",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return debug
        ? debugJson({ error: "upstream-not-ok", status: res.status, host: parsed.hostname })
        : fallback(`upstream-${res.status}`);
    }

    const ct = res.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) {
      return debug
        ? debugJson({ error: "bad-content-type", ct, host: parsed.hostname })
        : fallback("bad-ct");
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return debug
        ? debugJson({ error: "too-big", size: buf.byteLength, limit: MAX_BYTES })
        : fallback(`too-big-${buf.byteLength}`);
    }

    if (debug) {
      return debugJson({
        ok: true,
        host: parsed.hostname,
        contentType: ct,
        size: buf.byteLength,
      });
    }

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        // Cache 1 ngày ở edge, browser 1 giờ — refresh hàng ngày từ cron
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch (err) {
    return debug
      ? debugJson({ error: "fetch-throw", detail: String(err?.message || err) })
      : fallback("throw");
  }
}
