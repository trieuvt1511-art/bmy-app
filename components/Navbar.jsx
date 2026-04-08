"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Flame, Leaf, BookOpen, Heart, ShoppingCart, Newspaper } from "lucide-react";
import { useI18n } from "./LanguageProvider";
import { useFavorites } from "./FavoritesProvider";
import { useShoppingList } from "./ShoppingListProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Navbar() {
  const { t } = useI18n();
  const { favorites } = useFavorites();
  const { items: shoppingItems } = useShoppingList();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/",            label: t("nav.trending"),    icon: Flame },
    { href: "/ingredients", label: t("nav.ingredients"), icon: Leaf },
    { href: "/recipes",     label: t("nav.recipes"),     icon: BookOpen },
    { href: "/blog",        label: t("nav.blog"),        icon: Newspaper },
    { href: "/favorites",   label: t("nav.favorites"),   icon: Heart, badge: favorites.length },
    { href: "/shopping",    label: t("nav.shopping"),    icon: ShoppingCart, badge: shoppingItems.length },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="group-hover:scale-110 transition-transform">
            <Logo size={36} />
          </div>
          <span className="font-display font-black text-xl text-brand-900">
            Yum<span className="text-brand-500">Go</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                isActive(href)
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                  : "text-brand-900 hover:bg-brand-50"
              }`}
            >
              <Icon size={16} />
              {label}
              {badge > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-pink text-white text-[10px] font-black flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 rounded-full bg-brand-50 text-brand-900 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-brand-100 bg-white animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold ${
                  isActive(href)
                    ? "bg-brand-500 text-white"
                    : "text-brand-900 hover:bg-brand-50"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent-pink text-white text-[11px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
