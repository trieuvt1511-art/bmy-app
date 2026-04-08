"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { getBmyBlogBySlug, BMY_BLOG_POSTS } from "@/lib/bmyBlog";

function renderBody(body) {
  // Very small markdown subset: ## headings, paragraphs, bullets (1. … / - …)
  const blocks = body.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="font-display font-black text-2xl sm:text-3xl text-brand-900 mt-10 mb-3"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (/^\d+\.\s/.test(trimmed) || /^- /.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s+|-\s+/, ""));
      return (
        <ol key={i} className="list-decimal pl-5 space-y-2 my-4">
          {items.map((it, j) => (
            <li key={j} className="text-brand-900/85 leading-relaxed">
              {it}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="text-brand-900/85 leading-relaxed my-4">
        {trimmed}
      </p>
    );
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBmyBlogBySlug(slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-brand-900/60">Không tìm thấy bài viết.</p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 mt-4 text-brand-500 font-bold"
        >
          <ArrowLeft size={16} /> Quay lại blog
        </Link>
      </div>
    );
  }

  const related = BMY_BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-brand-500 font-bold mb-6 hover:gap-2 transition-all"
      >
        <ArrowLeft size={16} /> Quay lại blog
      </Link>

      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-900 leading-[1.1]">
        {post.title}
      </h1>

      <p className="mt-4 text-lg text-brand-900/75">{post.excerpt}</p>

      <div className="mt-5 flex items-center gap-4 text-sm text-brand-900/60">
        <span className="flex items-center gap-1">
          <Calendar size={14} /> {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {post.readMin} phút đọc
        </span>
        <span className="flex items-center gap-1">
          <User size={14} /> {post.author}
        </span>
      </div>

      <div className="mt-6 rounded-3xl overflow-hidden border border-brand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt={post.title} className="w-full aspect-[16/9] object-cover" />
      </div>

      <div className="mt-4">{renderBody(post.body)}</div>

      {/* Related */}
      <section className="mt-16 border-t border-brand-100 pt-8">
        <h3 className="font-display font-black text-xl text-brand-900 mb-4">
          Đọc thêm
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/blog/${r.slug}`}
              className="group bg-white border border-brand-100 rounded-2xl overflow-hidden card-hover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.cover}
                alt={r.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-3">
                <h4 className="font-display font-bold text-sm text-brand-900 group-hover:text-brand-600 line-clamp-2">
                  {r.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
