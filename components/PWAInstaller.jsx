"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "./LanguageProvider";
import Logo from "./Logo";

export default function PWAInstaller() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  // Register service worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("SW registration failed:", err);
        });
      });
    }
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setDeferred(e);
      // show after small delay to not be annoying
      setTimeout(() => setVisible(true), 4000);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setDeferred(null);
      setVisible(false);
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-white border border-brand-200 rounded-3xl shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <Logo size={48} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-brand-900">
            {t("install.title")}
          </div>
          <p className="text-xs text-brand-900/60 mt-0.5">{t("install.desc")}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="px-4 py-1.5 bg-brand-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-md shadow-brand-500/30"
            >
              <Download size={14} /> {t("install.install")}
            </button>
            <button
              onClick={() => setVisible(false)}
              className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-sm font-bold"
            >
              {t("install.dismiss")}
            </button>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-brand-50 text-brand-400 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
