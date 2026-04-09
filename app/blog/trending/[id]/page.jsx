"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Rss,
  ExternalLink,
  Clock,
  Tag as TagIcon,
} from "lucide-react";

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Mini markdown renderer — đủ cho output ## heading + paragraph
// do Groq trả về. Không dùng thư viện markdown bên ngoài để giữ bundle nhỏ.
function renderBody(md) {
  if (!md) return null;
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let para = [];
  const flush = () => {
    if (para.length > 0) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flush();
      blocks.push({ type: "li", text: line.slice(2).trim() });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks.map((b, i) => {
    if (b.type === "h2")
      return (
        <h2
          key={i}
          className="font-display font-black text-2xl sm:text-3xl text-brand-900 mt-10 mb-4"
        >
          {b.text}
        </h2>
      );
    if (b.type === "h3")
      return (
        <h3
          key={i}
          className="font-display font-bold text-xl text-brand-900 mt-6 mb-3"
        >
          {b.text}
        </h3>
      );
    if (b.type === "li")
      return (
        <li key={i} className="text-brand-900/85 leading-relaxed ml-6 list-disc">
          {b.text}
        </li>
      );
    return (
      <p key={i} className="text-brand-900/85 leading-[1.85] text-[17px] my-4">
        {b.text}
      </p>
    );
  });
}

export default function TrendingArticlePage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/trending", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        const found = (data?.items || []).find((x) => x.id === id);
        if (!found) {
          setNotFound(true);
        } else {
          setArticle(found);
          setRefreshedAt(data?.refreshedAt || null);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="aspect-[16/9] bg-brand-100/70 rounded-3xl animate-pulse" />
        <div className="h-10 bg-brand-100/70 rounded-lg animate-pulse mt-6 w-3/4" />
        <div className="h-4 bg-brand-100/70 rounded animate-pulse mt-3 w-1/2" />
        <div className="h-4 bg-brand-100/60 rounded animate-pulse mt-6" />
        <div className="h-4 bg-brand-100/60 rounded animate-pulse mt-2" />
        <div className="h-4 bg-brand-100/60 rounded animate-pulse mt-2 w-5/6" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display font-black text-3xl text-brand-900">
          Không tìm thấy bài viết
        </h1>
        <p className="text-brand-900/60 mt-3">
          Có thể cron hôm nay đã thay thế bài này bằng tin mới hơn.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 mt-6 text-brand-600 font-bold"
        >
          <ArrowLeft size={16} /> Về Blog B'My
        </Link>
      </div>
    );
  }

  const img = article.imageProxy || article.image || "";
  const readMin = Math.max(3, Math.round((article.bodyVi || "").length / 700));

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-brand-600 font-bold text-sm mb-6 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Về Blog B'My
      </Link>

      {img && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={img}
          alt={article.titleVi}
          className="w-full aspect-[16/9] object-cover rounded-3xl border border-brand-100"
          loading="lazy"
        />
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-brand-500 font-bold uppercase tracking-wider">
        <Rss size={14} /> {article.sourceName}
        <span className="text-brand-900/30">•</span>
        <Clock size={14} /> {readMin} phút đọc
      </div>

      <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-900 mt-3 leading-tight">
        {article.titleVi}
      </h1>

      {article.leadVi && (
        <p className="text-brand-900/70 text-lg sm:text-xl mt-5 leading-relaxed italic">
          {article.leadVi}
        </p>
      )}

      {(article.tags || []).length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold border border-brand-100"
            >
              <TagIcon size={11} /> {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-brand-900/40">
        Biên tập bởi B'My Kitchen
        {article.publishedAt && ` • Tư liệu gốc: ${formatDate(article.publishedAt)}`}
      </div>

      <hr className="my-8 border-brand-100" />

      <div className="prose prose-lg max-w-none">{renderBody(article.bodyVi)}</div>

      {/* Source citation — luôn luôn hiển thị để tôn trọng nguồn gốc */}
      <div className="mt-12 p-5 rounded-2xl bg-brand-50 border border-brand-100">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2">
          Nguồn tham khảo
        </div>
        <div className="text-sm text-brand-900/80">
          Bài viết này được B'My Kitchen tổng hợp và viết lại với góc nhìn riêng,
          dựa trên tư liệu gốc:
        </div>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 break-all"
        >
          <ExternalLink size={14} />
          {article.originalTitle || article.sourceUrl} — {article.sourceName}
        </a>
      </div>

      {refreshedAt && (
        <div className="mt-6 text-center text-xs text-brand-900/30">
          Trang Trending được cập nhật lúc{" "}
          {new Date(refreshedAt).toLocaleString("vi-VN")}
        </div>
      )}
    </article>
  );
}
