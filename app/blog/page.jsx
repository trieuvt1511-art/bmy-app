"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, BookOpen, Clock, ArrowRight, Rss, Sparkles } from "lucide-react";
import { BMY_BLOG_POSTS } from "@/lib/bmyBlog";

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Proxy external images qua /api/img-proxy để tránh hotlink block + CORS + lazy-load race
function proxify(url) {
  if (!url || !/^https?:\/\//.test(url)) return url;
  try {
    const u = btoa(url).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `/api/img-proxy?u=${u}`;
  } catch {
    return url;
  }
}

// Gradient fallback khi ảnh hỏng — 6 cặp màu theo index
const GRADIENTS = [
  "from-orange-200 to-pink-200",
  "from-amber-200 to-yellow-200",
  "from-emerald-200 to-teal-200",
  "from-rose-200 to-red-200",
  "from-sky-200 to-indigo-200",
  "from-lime-200 to-emerald-200",
];

export default function BlogPage() {
  const [trending, setTrending] = useState([]);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/trending", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setTrending(data?.items || []);
          setRefreshedAt(data?.refreshedAt || null);
        }
      } catch {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* HERO */}
      <div className="bg-gradient-card rounded-3xl p-6 sm:p-10 border border-brand-100">
        <div className="flex items-center gap-2 text-brand-500 font-bold text-sm mb-3">
          <BookOpen size={18} /> Blog B'My
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-900">
          Chuyện ẩm thực Việt &amp; xu hướng thế giới 🌏
        </h1>
        <p className="text-brand-900/70 mt-3 max-w-2xl">
          Những bài viết gốc của B'My Kitchen, kèm dòng tin trending được cập nhật
          mỗi ngày từ các tạp chí ẩm thực quốc tế.
        </p>
      </div>

      {/* TRENDING SECTION */}
      <section className="mt-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-900 flex items-center gap-2">
            <Flame className="text-accent-pink" /> Trending hôm nay
          </h2>
          <div className="flex items-center gap-2 text-xs text-brand-900/50">
            <Rss size={14} />
            {refreshedAt
              ? `Cập nhật ${new Date(refreshedAt).toLocaleString("vi-VN")}`
              : "Đang chờ lần refresh đầu tiên"}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-brand-100/60 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className="p-6 bg-brand-50 border border-dashed border-brand-200 rounded-3xl text-center text-brand-900/60">
            <Sparkles className="inline mr-2" size={16} />
            Danh sách trending còn trống. Cron hằng ngày sẽ tự pull bài mới và
            viết lại bằng giọng của B'My Kitchen.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((t) => {
              const img = t.imageProxy || t.image || "";
              return (
                <Link
                  key={t.id}
                  href={`/blog/trending/${t.id}`}
                  className="group bg-white border border-brand-100 rounded-3xl overflow-hidden card-hover block"
                >
                  {img ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img}
                      alt={t.titleVi || t.originalTitle || t.title}
                      className="w-full aspect-[16/9] object-cover bg-brand-50"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        // Nếu proxy fail, fallback qua raw external image
                        if (t.image && e.currentTarget.src !== t.image) {
                          e.currentTarget.src = t.image;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-gradient-to-br from-brand-100 to-brand-200" />
                  )}
                  <div className="p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-brand-500 mb-1">
                      {t.sourceName}
                    </div>
                    <h3 className="font-display font-black text-lg text-brand-900 group-hover:text-brand-600 line-clamp-2">
                      {t.titleVi || t.originalTitle || t.title}
                    </h3>
                    {t.excerptVi && (
                      <p className="text-sm text-brand-900/70 mt-2 line-clamp-3">
                        {t.excerptVi}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(t.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-brand-500 font-bold">
                      Đọc bài viết <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* EVERGREEN SECTION */}
      <section className="mt-14">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-900 mb-4">
          Bài viết của B'My Kitchen
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BMY_BLOG_POSTS.map((p, idx) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group bg-white border border-brand-100 rounded-3xl overflow-hidden card-hover"
            >
              <div
                className={`w-full aspect-[16/9] bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} relative overflow-hidden`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proxify(p.cover)}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    // Nếu proxy fail, hide img để gradient background hiện ra
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-brand-900/50 mb-2">
                  <span>{formatDate(p.date)}</span>
                  <span>•</span>
                  <Clock size={12} /> {p.readMin} phút
                </div>
                <h3 className="font-display font-black text-xl text-brand-900 group-hover:text-brand-600 line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-sm text-brand-900/70 mt-2 line-clamp-3">
                  {p.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
