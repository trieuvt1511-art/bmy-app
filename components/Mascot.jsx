"use client";

import { useState } from "react";

/**
 * B'My mascot component.
 *
 * Mỗi biến thể mascot nên có file PNG thật trong /public/bmy/ với
 * các tên cố định dưới đây. Vì hiện tại các file PNG chưa được vẽ nên
 * component sẽ IM LẶNG fallback sang emoji — không flash broken image,
 * không phát network request cho file chưa tồn tại.
 *
 * Khi có file thật, chỉ cần thêm tên file vào AVAILABLE_MASCOTS bên dưới,
 * component sẽ tự động nhận (không cần sửa gì thêm).
 *
 *   mascot-leek.png        — ngồi ôm bó tỏi tây, nón len đỏ, áo xanh
 *   mascot-herbs-blue.png  — ngồi ôm rau thơm, mũ lưỡi trai xanh, áo đỏ
 *   mascot-herbs-red.png   — ngồi ôm rau thơm, mũ lưỡi trai đỏ, áo xanh
 *   mascot-study-red.png   — cúi đọc sách + drink, nón len đỏ
 *   mascot-study-blue.png  — cúi đọc sách + drink, nón len xanh
 *   mascot-skate-blue.png  — ngồi xổm trên ván "Bánh mỳ Việt Nam", áo xanh
 *   mascot-skate-red.png   — ngồi xổm trên ván "Bánh mỳ Việt Nam", áo đỏ
 *   mascot-skate-jump.png  — bay trượt ván cầm túi, nón đỏ, áo vàng
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

// Whitelist những file PNG ĐÃ tồn tại trong /public/bmy/.
// Rỗng → luôn dùng emoji fallback.
const AVAILABLE_MASCOTS = new Set([
  // "skate-jump", "leek", ...  ← bỏ comment khi có file thật
]);

export default function Mascot({
  name = "skate-jump",
  size = 160,
  className = "",
  alt = "B'My mascot",
  floating = false,
}) {
  const hasPng = AVAILABLE_MASCOTS.has(name);
  const [errored, setErrored] = useState(!hasPng);

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center ${className} ${floating ? "animate-float" : ""}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        aria-label={alt}
        role="img"
      >
        {EMOJI_FALLBACK[name] || "🥖"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/bmy/mascot-${name}.png`}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`${className} ${floating ? "animate-float" : ""}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
