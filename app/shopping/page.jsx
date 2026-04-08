"use client";

import Link from "next/link";
import { ShoppingCart, Trash2, Check, X, Copy, Download } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { useShoppingList } from "@/components/ShoppingListProvider";
import Mascot from "@/components/Mascot";

export default function ShoppingPage() {
  const { t } = useI18n();
  const { items, removeItem, toggleChecked, clear } = useShoppingList();
  const [copied, setCopied] = useState(false);

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const asText = items
    .map((i) => {
      const mea = i.measures.length ? ` (${i.measures.join(", ")})` : "";
      return `${i.checked ? "[x]" : "[ ]"} ${i.ingredient}${mea}`;
    })
    .join("\n");

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(asText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const downloadList = () => {
    const blob = new Blob([asText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yumgo-shopping-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="bg-gradient-card dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-brand-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-accent-green font-bold text-sm mb-3">
          <ShoppingCart size={18} /> {t("nav.shopping")}
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brand-900 dark:text-white">
          {t("shopping.title")} 🛒
        </h1>
        <p className="text-brand-900/70 dark:text-white/70 mt-2 max-w-xl">
          {t("shopping.subtitle")}
        </p>

        {items.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={copyList}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-full text-sm font-bold hover:scale-105 transition"
            >
              <Copy size={14} /> {copied ? t("shopping.copied") : t("shopping.copy")}
            </button>
            <button
              onClick={downloadList}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 text-brand-600 dark:text-white rounded-full text-sm font-bold hover:bg-brand-50 dark:hover:bg-neutral-700"
            >
              <Download size={14} /> {t("shopping.download")}
            </button>
            <button
              onClick={clear}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 text-brand-600 dark:text-white rounded-full text-sm font-bold hover:bg-brand-50 dark:hover:bg-neutral-700"
            >
              <Trash2 size={14} /> {t("shopping.clear")}
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Mascot name="leek" size={180} floating />
          </div>
          <p className="text-brand-900/60 dark:text-white/60 max-w-md mx-auto mb-6">
            {t("shopping.empty")}
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-full font-bold shadow-lg shadow-brand-500/30 hover:scale-105 transition"
          >
            {t("recipes.title")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-2">
          {/* Unchecked first */}
          {unchecked.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              onToggle={toggleChecked}
              onRemove={removeItem}
              t={t}
            />
          ))}
          {/* Checked section */}
          {checked.length > 0 && (
            <>
              <div className="pt-4 pb-2 text-xs font-bold text-brand-900/50 dark:text-white/50 uppercase tracking-wider">
                {t("shopping.done")} ({checked.length})
              </div>
              {checked.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={toggleChecked}
                  onRemove={removeItem}
                  t={t}
                />
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function ShoppingItem({ item, onToggle, onRemove, t }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 border border-brand-100 dark:border-neutral-800 rounded-2xl transition ${
        item.checked ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
          item.checked
            ? "bg-brand-500 border-brand-500 text-white"
            : "border-brand-300 dark:border-neutral-600 hover:border-brand-500"
        }`}
        aria-label="Toggle"
      >
        {item.checked && <Check size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={`font-bold text-brand-900 dark:text-white ${
            item.checked ? "line-through" : ""
          }`}
        >
          {item.ingredient}
        </div>
        <div className="text-xs text-brand-900/60 dark:text-white/60 mt-0.5">
          {item.measures.length > 0 && (
            <span className="font-semibold">{item.measures.join(", ")}</span>
          )}
          {item.measures.length > 0 && item.from.length > 0 && " · "}
          {item.from.length > 0 && (
            <span>
              {t("shopping.forLabel")}{" "}
              {item.from.slice(0, 2).map((f) => f.mealName).join(", ")}
              {item.from.length > 2 && ` +${item.from.length - 2}`}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-brand-50 dark:hover:bg-neutral-800 text-brand-400 flex items-center justify-center"
        aria-label="Remove"
      >
        <X size={16} />
      </button>
    </div>
  );
}
