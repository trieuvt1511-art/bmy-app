"use client";

import { useState } from "react";

/**
 * YumGo Logo
 * - Loads /yumgo-logo.png (B'My mascot) from /public
 * - If the file is missing (e.g. before you drop the PNG in), falls back to 🍜 emoji
 *   so the app never breaks.
 *
 * To set the real logo: save your mascot PNG (transparent background, ~512x512)
 * as `public/yumgo-logo.png` in the yumgo-app folder.
 */
export default function Logo({ size = 36, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`rounded-2xl bg-gradient-hero flex items-center justify-center text-lg shadow-lg shadow-brand-500/30 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span aria-hidden>🍜</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/yumgo-logo.png"
          alt="YumGo"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
