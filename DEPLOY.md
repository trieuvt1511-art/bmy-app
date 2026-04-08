# YumGo — Hướng dẫn Deploy

App Next.js 14, khuyên dùng **Vercel** (free tier đủ dùng, deploy < 2 phút).

## Yêu cầu trước khi deploy

1. **Tài khoản Vercel** (miễn phí) — https://vercel.com/signup
2. **Node.js 18+** — kiểm tra bằng `node -v`
3. *(Optional nhưng khuyên dùng)* **Vercel KV** — cache dịch thuật miễn phí
4. *(Optional nhưng khuyên dùng)* **Groq API key** — chất lượng dịch ẩm thực cao, miễn phí tại https://console.groq.com

> **Không cần trả tiền cho bất kỳ API nào.** Groq và Vercel KV đều free tier thoải mái. Không có Groq thì app tự fallback về Google Translate.

---

## Cách 1: Deploy 1 dòng lệnh bằng Vercel CLI (nhanh nhất)

```bash
# Cài Vercel CLI (chỉ 1 lần)
npm install -g vercel

# Vào folder project
cd "~/Desktop/yumgo-app 4"     # hoặc path anh unzip tới

# Cài deps + deploy
npm install
vercel --prod
```

Khi chạy `vercel --prod` lần đầu nó sẽ hỏi vài câu; chọn defaults hoặc:

1. `Set up and deploy?` → **Y**
2. `Which scope?` → account anh
3. `Link to existing project?` → **Y** nếu đã deploy trước (chọn `yumgo`); **N** nếu lần đầu
4. `Project name?` → `yumgo`
5. Build tự động → URL production `https://yumgo.vercel.app`

---

## Cách 2: Lấy Groq API key để dịch mượt hơn (2 phút, khuyên làm)

Google Translate dịch thuật ngữ nấu ăn máy móc ("sauté" thành "sauté", "ground beef" thành "bò đất"). **Groq chạy Llama 3.3 70B với prompt có glossary ẩm thực** hiểu đúng ngữ cảnh và dịch như native cook viết công thức.

### Bước 1: Signup Groq
1. Vào https://console.groq.com/ → Sign Up (bằng Google/GitHub/email, không cần credit card)
2. Sau khi login → menu trái **API Keys** → **Create API Key**
3. Đặt tên: `yumgo` → Create
4. Copy key (bắt đầu bằng `gsk_...`) — **lưu ngay vì Groq chỉ show 1 lần**

Free tier: 14,400 request/ngày, 30 request/phút. Với KV cache, 1 công thức chỉ tốn 1 request mỗi ngôn ngữ vĩnh viễn → free tier thừa thãi cho vài nghìn món.

### Bước 2: Add vào Vercel
1. Vercel Dashboard → project yumgo → **Settings** → **Environment Variables**
2. Add new:
   - Key: `GROQ_API_KEY`
   - Value: paste key `gsk_...` vừa copy
   - Environments: tick **Production**, **Preview**, **Development**
3. Save

### Bước 3: Redeploy
```bash
vercel --prod
```

Hoặc Dashboard → Deployments → menu `⋯` → **Redeploy**.

### Kiểm tra Groq đang chạy
Mở 1 công thức bằng tiếng Việt → F12 (DevTools) → Network → click request `/api/translate` → xem Response → có field `"engine": "groq"` là đúng. Nếu thấy `"engine": "gtx"` nghĩa là đang fallback về Google Translate (có thể do Groq rate-limited hoặc key sai).

---

## Cách 3: Bật Vercel KV để cache dịch thuật (5 phút, khuyên làm)

YumGo tự động dịch toàn bộ công thức, nguyên liệu, tên món sang ngôn ngữ user chọn. **Không có KV** app vẫn chạy, chỉ là mỗi request đều gọi Google Translate (chậm hơn 300-500ms và dễ bị Google rate-limit khi lên production).

**Với KV**: mỗi chuỗi tiếng Anh chỉ dịch 1 lần duy nhất cho toàn bộ user, vĩnh viễn. Siêu nhanh, siêu rẻ.

### Bước 1: Tạo KV database

1. Vào https://vercel.com/dashboard → chọn project `yumgo`
2. Tab **Storage** → **Create Database** → chọn **KV (Redis)**
3. Chọn region **Frankfurt (fra1)** (khớp với region deploy trong vercel.json)
4. Đặt tên: `yumgo-translate-cache`
5. Click **Create**

### Bước 2: Connect vào project

1. Sau khi tạo xong, Vercel mở màn hình **Connect Project**
2. Chọn project `yumgo`, environment: tick cả 3 (Production + Preview + Development)
3. Click **Connect**

Vercel tự động inject 2 env vars `KV_REST_API_URL` và `KV_REST_API_TOKEN`. Anh không cần copy-paste gì.

### Bước 3: Redeploy

```bash
vercel --prod
```

Xong. Lần đầu user xem món "Beef Stroganoff" bằng tiếng Việt sẽ mất ~800ms để dịch, nhưng từ lần thứ 2 trở đi với MỌI user là ~50ms cached.

### Kiểm tra KV đang hoạt động

Vào Vercel Dashboard → Storage → `yumgo-translate-cache` → tab **Data Browser**. Sau khi user vào vài trang, anh sẽ thấy các key dạng `yumgo:t:vi:abc123...`.

---

## Cách 3: Deploy qua GitHub (tự động, khuyên dùng lâu dài)

```bash
cd "~/Desktop/yumgo-app 4"
git init
git add .
git commit -m "Initial commit"
gh repo create yumgo --public --source=. --push
```

Sau đó vào https://vercel.com/new → chọn repo `yumgo` → Deploy. Mỗi lần `git push` là auto redeploy.

---

## Cách 4: Chạy local trước khi deploy

```bash
cd "~/Desktop/yumgo-app 4"
npm install
npm run dev
```

Mở http://localhost:3000. Test checklist:

- [ ] Switch ngôn ngữ VI/EN/ES/ZH → toàn bộ UI + title món đổi
- [ ] Vào 1 công thức → nguyên liệu + cách làm tự động dịch (không cần bấm nút)
- [ ] Vào /ingredients → danh sách nguyên liệu dịch theo
- [ ] Bấm ♥ → qua tab "Yêu thích"
- [ ] Bấm "Thêm vào đi chợ"
- [ ] Logo YumGo hiển thị mascot baby B'My
- [ ] PWA: click biểu tượng "Install" ở address bar

Lưu ý: chạy local không có KV thì vẫn dùng localStorage làm cache per-user — test vẫn chạy ngon.

---

## Domain riêng (sau khi deploy)

Muốn dùng `app.bmy.es`:

1. Vercel Dashboard → project → Settings → Domains
2. Add `app.bmy.es`
3. Copy DNS record (CNAME) vào provider DNS
4. Chờ 1-5 phút → xong

---

## Cron daily refresh trending (bản v9)

App có route `/api/refresh-trending` tự kéo RSS từ The Kitchn, Serious Eats,
Bon Appétit, Food&Wine, Eater, Cooky.vn, Món Ngon Mỗi Ngày, rồi dùng Groq
Llama 3.3 70B viết lại tóm tắt tiếng Việt và lưu vào Vercel KV (hoặc file
`data/trending.json` khi dev local).

**Bật cron hằng ngày:**

1. `vercel.json` đã khai báo sẵn:
   ```json
   "crons": [{ "path": "/api/refresh-trending", "schedule": "15 6 * * *" }]
   ```
   → Chạy 6:15 UTC mỗi ngày (≈ 8:15 giờ Madrid mùa hè, 7:15 mùa đông).

2. Set env var `CRON_SECRET` trong Vercel:
   ```bash
   openssl rand -hex 32            # copy kết quả
   vercel env add CRON_SECRET production
   ```
   Vercel Cron sẽ tự gửi `Authorization: Bearer $CRON_SECRET` mỗi lần chạy.

3. Gọi thử tay:
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" \
     https://app.bmy.es/api/refresh-trending?dry=1
   ```
   Trả JSON `{ ok: true, count: N, engine: "groq" }` là đúng.

4. Xem kết quả tại `/blog` — section "Trending hôm nay" sẽ tự cập nhật.

> Ghi chú: free tier Vercel cho chạy **1 cron/ngày**, vừa đủ với nhu cầu của
> B'My. Muốn refresh nhiều lần hơn → nâng lên Pro hoặc dùng Cowork
> scheduled-tasks (xem phần bên dưới).

## Checklist trước khai trương B'My (1/5/2026)

- [ ] Deploy lên domain chính thức (`app.bmy.es`)
- [ ] Bật Vercel KV
- [ ] Set `CRON_SECRET` + verify `/api/refresh-trending` chạy OK
- [ ] Verify cron daily xuất hiện trong Vercel Dashboard → Crons
- [ ] Lưu `public/yumgo-logo.png` (resize 512×512 từ ảnh gốc 3000×3000 bằng `sips`)
- [ ] Tạo PWA icons từ logo: icon-192.png, icon-512.png, apple-touch-icon.png, favicon.png
- [ ] Thêm 8 file mascot vào `/public/bmy/` (xem `public/bmy/README.md`)
- [ ] Test trên iPhone Safari + Android Chrome
- [ ] Test PWA "Add to Home Screen"
- [ ] Test switch 4 ngôn ngữ, verify cache hit sau lần đầu
- [ ] Bật Vercel Analytics (free) để theo dõi traffic

---

## Troubleshooting

**"Module not found" khi build** → xoá `.next` + `node_modules`, chạy lại `npm install`.

**Dịch chậm lần đầu** → Bình thường. Google Translate mất 300-800ms/request. Lần thứ 2 trở đi là instant từ cache.

**Dịch không chạy, hiện tiếng Anh hoài** → mở DevTools → Network → xem request `/api/translate`. Nếu có, check Console tab có lỗi không. Có thể Google tạm block IP — rất hiếm.

**KV connect rồi vẫn chậm** → kiểm tra env vars có đúng không: Dashboard → Settings → Environment Variables → phải có `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

**Hình công thức chậm** → TheMealDB miễn phí, đôi khi server chậm. Không có gì phải sửa.

**Mascot không hiện** → mặc định sẽ fallback sang emoji 🍜, không lỗi. Lưu file `public/yumgo-logo.png` để hiện thật.
