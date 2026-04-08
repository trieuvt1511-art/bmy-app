"use client";

import { useState } from "react";

/**
 * B'My mascot component.
 *
 * Save your mascot PNGs into /public/bmy/ with these exact filenames:
 *
 *   mascot-leek.png        — ngồi ôm bó tỏi tây, nón len đỏ, áo xanh
 *   mascot-herbs-blue.png  — ngồi ôm rau thơm, mũ lưỡi trai xanh, áo đỏ
 *   mascot-herbs-red.png   — ngồi ôm rau thơm, mũ lưỡi trai đỏ, áo xanh
 *   mascot-study-red.png   — cúi đọc sách + drink, nón len đỏ
 *   mascot-study-blue.png  — cúi đọc sách + drink, nón len xanh
 *   mascot-skate-blue.png  — ngồi xổm trên ván "Bánh mỳ Việt Nam", áo xanh
 *   mascot-skate-red.png   — ngồi xổm trên ván "Bánh mỳ Việt Nam", áo đỏ
 *   mascot-skate-jump.png  — bay trượt ván cầm túi, nón đỏ, áo vàng
 *
 * Nếu file chưa có, component tự fallback sang emoji tương ứng.
 */

const EMOJI_FALLBACK = {
  "leek":         "🥬",
  "herbs-blue":   "🌿",
  "herbs-red":    "🌱",
  "study-red":    "📚",
  "study-blue":   "🥤",
  "skate-blue":   "🛹",
  "skate-red":    "🛹",
  "skate-jump":   "🤸",
};

export default function Mascot({
  name = "skate-jump",
  size = 160,
  className = "",
  alt = "B'My mascot",
  floating = false,
}) {
  const [errored, setErrored] = useState(false);
  const src = `/bmy/mascot-${name}.png`;

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        aria-label={alt}
      >
        {EMOJI_FALLBACK[name] || "🥖"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`${className} ${floating ? "animate-float" : ""}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
