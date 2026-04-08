# 🍜 YumGo — Global Cooking App

Webapp dạy nấu ăn đa ngôn ngữ (Việt / English / Español), kết nối dữ liệu thật từ **TheMealDB**. Giao diện trẻ trung kiểu foodie, tối ưu cho điện thoại.

## ✨ Tính năng chính

- **5 trang:**
  - `/` — **Trending**: hero gradient, 8 món random, grid vùng miền (🇻🇳🇮🇹🇪🇸🇯🇵🇹🇭🇫🇷🇨🇳🇮🇳), section quảng bá **B'My**, danh mục, features
  - `/ingredients` — **Nguyên liệu** Á–Âu (500+ nguyên liệu có ảnh, ô tìm kiếm real-time)
  - `/recipes` — **Công thức** (search + filter theo danh mục *và* vùng miền)
  - `/recipes/[id]` — **Chi tiết**: ảnh hero, nút tim lớn, nguyên liệu kèm định lượng & ảnh, các bước số hoá, video YouTube nhúng, link nguồn
  - `/favorites` — **Công thức yêu thích** (lưu bằng localStorage, badge đếm trên navbar)
  - `/bmy` — **Landing page B'My**: hero, story, menu preview (8 món), CTA khai trương 01/05/2026

- **Đa ngôn ngữ 🇻🇳 🇬🇧 🇪🇸** — nút Globe, auto-detect browser, lưu `localStorage`.
- **Favorites** — bấm ♥ trên mọi công thức, hiện badge trên navbar, trang riêng để xem lại.
- **PWA cài được như app native** — manifest.json, service worker (cache-first), icon, prompt cài app tự hiện trên mobile.
- **Offline-ready** — service worker cache app shell + API responses.
- **Mobile-first & responsive** — hoạt động mượt trên mọi màn hình.
- **Design trẻ trung foodie** — gradient cam/hồng/vàng, Fraunces + Inter, bo góc lớn, hover mượt, animations.
- **Dữ liệu thật** — TheMealDB API miễn phí (không cần key).

## 🛠 Tech stack

- **Next.js 14** (App Router) + React 18
- **Tailwind CSS 3** (tuỳ biến theme brand)
- **Lucide React** — icon set
- **TheMealDB** — API công thức & nguyên liệu

## 🚀 Chạy local

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev server
npm run dev

# 3. Mở http://localhost:3000
```

## 🌍 Deploy lên Vercel (miễn phí)

1. Push code này lên GitHub.
2. Vào [vercel.com/new](https://vercel.com/new), import repo.
3. Vercel tự detect Next.js → bấm **Deploy**.
4. Xong — có link dạng `yumgo.vercel.app` chia sẻ được ngay trên điện thoại.

Không cần biến môi trường nào cả, vì TheMealDB dùng test key `1` miễn phí.

## 📁 Cấu trúc thư mục

```
yumgo-app/
├── app/
│   ├── layout.jsx              # Root layout + Providers + PWA meta
│   ├── page.jsx                # Home / Trending
│   ├── globals.css             # Tailwind + fonts + animations
│   ├── ingredients/page.jsx    # Trang nguyên liệu
│   ├── recipes/page.jsx        # Danh sách công thức (search + filter)
│   ├── recipes/[id]/page.jsx   # Chi tiết món + video
│   ├── favorites/page.jsx      # Công thức yêu thích
│   └── bmy/page.jsx            # Landing page B'My
├── components/
│   ├── Navbar.jsx              # Header + badge Favorites + menu mobile
│   ├── LanguageSwitcher.jsx    # Chuyển VI/EN/ES
│   ├── LanguageProvider.jsx    # Context i18n
│   ├── FavoritesProvider.jsx   # Context Favorites (localStorage)
│   ├── RecipeCard.jsx          # Card món ăn + nút tim
│   ├── BMyPromo.jsx            # Section quảng bá B'My
│   ├── PWAInstaller.jsx        # SW register + install prompt
│   └── Footer.jsx
├── lib/
│   ├── i18n.js                 # Dictionary VI/EN/ES
│   └── api.js                  # Wrapper TheMealDB
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── icon.svg / icon-192.png / icon-512.png / apple-touch-icon.png
│   └── favicon.png
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── jsconfig.json
```

## 🎨 Customize

### Đổi màu brand
Sửa `tailwind.config.js` → `theme.extend.colors.brand.*`.

### Thêm ngôn ngữ (vd: tiếng Pháp)
1. Thêm `"fr"` vào mảng `LOCALES` trong `lib/i18n.js`.
2. Thêm object `fr: {...}` trong `translations` (copy từ `en` rồi dịch).
3. Thêm `fr: { flag: "🇫🇷", name: "Français", short: "FR" }` trong `LOCALE_LABELS`.

### Đổi nguồn API
Sửa `lib/api.js`. Các hàm đã chuẩn hoá theo format `{strMeal, strMealThumb, idMeal, ...}`, chỉ cần map lại từ API mới.

## 🧭 Roadmap gợi ý (v2)

- [x] ~~Lưu công thức yêu thích (localStorage)~~ ✅
- [x] ~~PWA — cài vào home screen như app native~~ ✅
- [x] ~~Tích hợp với B'My~~ ✅
- [x] ~~Filter theo vùng miền~~ ✅
- [ ] Tạo tài khoản (Supabase) + upload công thức của user
- [ ] Lọc theo thời gian nấu, độ khó, chế độ ăn (chay/halal/gluten-free)
- [ ] Dịch tự động công thức sang VI/ES bằng Claude API
- [ ] Shopping list — chọn món, tự gộp nguyên liệu thành danh sách đi chợ
- [ ] Tích hợp NailBoost nếu muốn cross-promote với cộng đồng Việt châu Âu

## 📝 License

MIT — thoải mái sửa & dùng cho dự án cá nhân/thương mại.

---
Made with 🧡 in Madrid
