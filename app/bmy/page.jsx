"use client";

import Link from "next/link";
import { MapPin, Clock, Calendar, Instagram, ChefHat, Coffee, Sparkles } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import Mascot from "@/components/Mascot";

export default function BMyPage() {
  const { t } = useI18n();

  const menu = [
    { emoji: "🥖", name: "Bánh Mì Thịt Nướng", desc: "Pork grilled over charcoal, pickled carrot, coriander", price: "6,50 €" },
    { emoji: "🥖", name: "Bánh Mì Gà Xé", desc: "Lemongrass shredded chicken, spicy mayo", price: "6,00 €" },
    { emoji: "🥖", name: "Bánh Mì Chay", desc: "Tofu, mushroom pâté, crunchy veggies", price: "5,50 €" },
    { emoji: "🥖", name: "Bánh Mì Pâté Trứng", desc: "Pâté and fried egg — classic breakfast", price: "5,00 €" },
    { emoji: "☕", name: "Cà Phê Sữa Đá", desc: "Iced Vietnamese coffee with condensed milk", price: "3,80 €" },
    { emoji: "☕", name: "Cà Phê Trứng", desc: "Hanoi egg coffee — creamy and sweet", price: "4,20 €" },
    { emoji: "🥤", name: "Trà Đào Cam Sả", desc: "Peach · orange · lemongrass iced tea", price: "4,50 €" },
    { emoji: "🍡", name: "Chè Ba Màu", desc: "Tricolor sweet beans with coconut milk", price: "4,00 €" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,63,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,77,141,0.2),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur rounded-full text-xs font-bold mb-5">
              <Sparkles size={14} /> {t("bmy.tag")}
            </div>
            <h1 className="font-display font-black text-5xl sm:text-7xl leading-[0.95]">
              B'My <span className="text-accent-yellow">🥖☕</span>
            </h1>
            <p className="mt-4 text-xl text-white/85 max-w-2xl">
              {t("bmy.desc")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
                <Calendar size={14} /> Grand opening: 01 May 2026
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
                <MapPin size={14} /> Madrid, España
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
                <Clock size={14} /> 8:00 – 22:00
              </div>
            </div>
          </div>

          {/* Mascot hero visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-accent-yellow/20 rounded-full blur-3xl" />
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-accent-pink/30 rounded-full blur-2xl" />
              <div className="relative">
                <Mascot name="skate-jump" size={280} floating />
              </div>
            </div>
          </div>
        </div>
        <svg className="relative block w-full h-12" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#fffbf8" d="M0,60 C240,120 480,0 720,50 C960,100 1200,20 1440,60 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900 text-center">
          Câu chuyện B'My
        </h2>

        <div className="mt-6 grid md:grid-cols-[auto_1fr] gap-6 items-center max-w-3xl mx-auto">
          <div className="hidden md:block flex-shrink-0">
            <Mascot name="herbs-blue" size={160} className="animate-wiggle" />
          </div>
          <p className="text-brand-900/75 leading-relaxed text-center md:text-left">
            B'My ra đời từ nỗi nhớ — nhớ tiếng rao bánh mì buổi sáng Hà Nội, mùi thơm của ổ bánh
            vừa ra lò, vị đậm đà của pate, và cà phê sữa đá nhỏ giọt chậm rãi. Chúng tôi mang
            những hương vị đó đến trung tâm Madrid, giới thiệu ẩm thực Việt đến người bản xứ và
            mang quê nhà gần hơn với cộng đồng Việt châu Âu.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { Icon: ChefHat, title: "Công thức gia truyền", desc: "Pate, nước sốt và bánh mì tự làm theo công thức Bắc Bộ." },
            { Icon: Coffee, title: "Cà phê Robusta Việt", desc: "Hạt Robusta Đắk Lắk, pha phin chuẩn Việt Nam." },
            { Icon: MapPin, title: "Giữa lòng Madrid", desc: "Không gian trẻ trung, thân thiện, phục vụ cả ngày." },
          ].map(({ Icon, title, desc }, i) => (
            <div key={i} className="bg-white border border-brand-100 rounded-3xl p-5 card-hover">
              <div className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-3 shadow-md shadow-brand-500/30">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-900">{title}</h3>
              <p className="text-sm text-brand-900/70 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
        {/* Decorative mascots flanking the menu */}
        <div className="hidden lg:block absolute -left-24 top-24 pointer-events-none">
          <Mascot name="skate-red" size={140} className="animate-float" />
        </div>
        <div className="hidden lg:block absolute -right-24 top-24 pointer-events-none">
          <Mascot name="skate-blue" size={140} className="animate-float" />
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-900 text-center">
          Menu (xem trước)
        </h2>
        <p className="text-brand-900/60 text-center mt-2">8 món đầu tiên — menu chính thức công bố 01/05/2026</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {menu.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white border border-brand-100 rounded-2xl card-hover"
            >
              <div className="text-4xl flex-shrink-0">{m.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-brand-900">{m.name}</div>
                <div className="text-xs text-brand-900/60 line-clamp-2">{m.desc}</div>
              </div>
              <div className="font-black text-brand-500">{m.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative bg-gradient-hero rounded-3xl p-8 sm:p-12 text-white text-center overflow-hidden">
          {/* Mascot peeking from corner */}
          <div className="hidden sm:block absolute -top-4 -right-4 pointer-events-none">
            <Mascot name="study-red" size={140} className="animate-float" />
          </div>
          <div className="hidden sm:block absolute -bottom-4 -left-4 pointer-events-none opacity-90">
            <Mascot name="leek" size={120} className="animate-wiggle" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl relative">Hẹn gặp ngày 01/05/2026</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto relative">
            Theo dõi Instagram để nhận ưu đãi ngày khai trương và cập nhật menu mỗi tuần.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 relative">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-full font-bold shadow-xl hover:scale-105 transition"
            >
              <Instagram size={18} /> @bmy.madrid
            </a>
            <Link
              href="/recipes?area=Vietnamese"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur rounded-full font-bold border border-white/40 hover:bg-white/30 transition"
            >
              Xem công thức Việt
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
