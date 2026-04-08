"use client";

import Link from "next/link";
import {
  Calendar, Users, CreditCard, Bell, Globe, MessageCircle,
  Sparkles, Smartphone, TrendingUp, Star,
} from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";

export default function NailBoostPage() {
  const { t } = useI18n();

  const features = [
    { Icon: Calendar, title: "Đặt lịch online",        desc: "Khách book lịch 24/7 qua link, không cần gọi điện." },
    { Icon: Users, title: "CRM khách hàng",            desc: "Lưu sở thích, lịch sử, sinh nhật, auto-nhắc chăm sóc." },
    { Icon: CreditCard, title: "Thu ngân & hoá đơn",   desc: "Tính tiền nhanh, chia hoa hồng thợ tự động." },
    { Icon: Bell, title: "Nhắc lịch & marketing",      desc: "SMS/WhatsApp nhắc lịch, gửi promo, giảm no-show." },
    { Icon: Globe, title: "Đa ngôn ngữ EU",            desc: "VI/EN/ES/FR/DE — phục vụ cả cộng đồng Việt & khách bản xứ." },
    { Icon: MessageCircle, title: "Chat nội bộ",       desc: "Thợ và chủ tiệm chat, chia sẻ hình mẫu nail nhanh chóng." },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-fuchsia-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,210,63,0.15),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur rounded-full text-xs font-bold mb-5">
            <Sparkles size={14} /> {t("nailboost.tag")}
          </div>
          <h1 className="font-display font-black text-5xl sm:text-7xl leading-[0.95]">
            NailBoost <span className="text-accent-yellow">💅</span>
          </h1>
          <p className="mt-4 text-xl text-white/85 max-w-2xl">{t("nailboost.desc")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              <Users size={14} /> Cộng đồng Việt châu Âu
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              <Smartphone size={14} /> iOS · Android · Web
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              <TrendingUp size={14} /> Đang build
            </div>
          </div>
        </div>
        <svg className="relative block w-full h-12" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#fffbf8" className="dark:fill-neutral-950" d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,60 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900 dark:text-white text-center">
          Tính năng chính
        </h2>
        <p className="text-brand-900/60 dark:text-white/60 text-center mt-2 max-w-2xl mx-auto">
          Tất cả những gì một tiệm nail cần trong một app duy nhất.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 border border-brand-100 dark:border-neutral-800 rounded-3xl p-5 card-hover"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center mb-3 shadow-lg">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-brand-900/70 dark:text-white/70 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials mock */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900 dark:text-white text-center">
          Ai đang chờ NailBoost?
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {[
            { name: "Chị Hương", shop: "Nail Lily · Berlin",  text: "Mình đang dùng Excel quản lý, NailBoost ra là chuyển liền!" },
            { name: "Chị Mai",   shop: "Beauty Nail · Praha", text: "Cần nhất là nhắc khách đỡ no-show và chia hoa hồng thợ." },
          ].map((r, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-brand-100 dark:border-neutral-800 rounded-3xl p-5">
              <div className="flex items-center gap-1 text-accent-yellow mb-2">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
              </div>
              <p className="text-brand-900/80 dark:text-white/80 italic">"{r.text}"</p>
              <div className="mt-3 text-sm">
                <div className="font-bold text-brand-900 dark:text-white">{r.name}</div>
                <div className="text-xs text-brand-900/60 dark:text-white/60">{r.shop}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-fuchsia-500 rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="font-display font-black text-3xl sm:text-4xl">Đăng ký early access</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            Để lại email, chúng tôi sẽ gửi link dùng thử ngay khi NailBoost ra beta.
          </p>
          <form
            className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Cảm ơn anh/chị đã đăng ký! Chúng tôi sẽ liên hệ sớm.");
            }}
          >
            <input
              type="email"
              required
              placeholder="email@example.com"
              className="flex-1 px-4 py-3 rounded-full bg-white/20 backdrop-blur text-white placeholder-white/70 border border-white/30 focus:outline-none focus:bg-white/30"
            />
            <button className="px-6 py-3 bg-white text-fuchsia-700 rounded-full font-bold shadow-xl hover:scale-105 transition">
              Đăng ký
            </button>
          </form>
          <Link
            href="/"
            className="mt-6 inline-block text-white/70 hover:text-white text-sm"
          >
            ← Về trang chủ YumGo
          </Link>
        </div>
      </section>
    </>
  );
}
