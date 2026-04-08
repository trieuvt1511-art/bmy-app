# Deploy B'My qua GitHub + Vercel (one-time setup)

Đây là cách "lười" nhất nhưng bền vững nhất. Sau khi setup 1 lần (~5 phút),
mỗi lần đẩy phiên bản mới anh chỉ cần chạy **1 lệnh duy nhất**.

## Bước 1 — Chuẩn bị (1 phút)

Cài GitHub CLI nếu chưa có:

```bash
brew install gh
```

Sau đó giải nén v9 và vào folder:

```bash
cd ~/Downloads
unzip -o yumgo-app-v9-content.zip
cd yumgo-app-v9-content
```

> Em đã git init sẵn folder này với 1 commit đầu tiên — anh không cần làm gì thêm.

## Bước 2 — Chạy setup script (2 phút)

```bash
./scripts/setup-github.sh
```

Script sẽ tự:

1. Mở browser cho anh `gh auth login` — anh bấm Authorize trong Chrome là xong
2. Tạo repo `bmy-app` trên GitHub (mặc định private)
3. Push toàn bộ code lên repo đó

Muốn repo public thay vì private:

```bash
REPO_VISIBILITY=public ./scripts/setup-github.sh
```

Muốn tên repo khác `bmy-app`:

```bash
REPO_NAME=bmy-web ./scripts/setup-github.sh
```

## Bước 3 — Kết nối Vercel với repo (2 phút, làm trên web)

1. Mở <https://vercel.com/new>
2. Bấm **Import** bên cạnh repo `bmy-app` vừa tạo
3. Vercel tự detect Next.js → bấm **Deploy**
4. Vào **Project → Settings → Environment Variables**, thêm 4 biến:

   | Tên | Lấy ở đâu |
   |-----|-----------|
   | `GROQ_API_KEY` | <https://console.groq.com> → API Keys |
   | `KV_REST_API_URL` | Vercel → Storage → Create KV (tự inject) |
   | `KV_REST_API_TOKEN` | Như trên |
   | `CRON_SECRET` | Sinh bằng `openssl rand -hex 32`, copy chuỗi dán vào |

5. Vào tab **Deployments → ⋯ → Redeploy** để Vercel load env vars mới
6. Vào tab **Crons** — xác nhận `/api/refresh-trending · 15 6 * * *` đã xuất hiện

Xong. Từ giờ mỗi khi anh `git push` là Vercel auto deploy.

---

## Từ lần deploy thứ 2 trở đi

Sau khi anh sửa bất cứ file nào (menu món, giá, bài blog, màu sắc...), chỉ cần:

```bash
./scripts/redeploy.sh "thay menu Bánh Mì Chay"
```

Hoặc gọn hơn, không cần viết message:

```bash
./scripts/redeploy.sh
```

Script sẽ commit + push. Vercel nhận webhook, build, và 1–2 phút sau phiên bản mới live.

Theo dõi build tại <https://vercel.com/dashboard>. Nếu build fail, Vercel gửi email cho anh kèm log.

---

## Rollback khi cần

Vào Vercel Dashboard → **Deployments** → chọn deployment cũ đang hoạt động tốt → bấm **⋯ → Promote to Production**. Mất ~10 giây, không cần đụng code.

---

## Vì sao cách này tốt hơn Vercel CLI?

| | Vercel CLI (`vercel --prod`) | GitHub + Vercel |
|---|---|---|
| Lần đầu | Nhanh hơn (2 phút) | Lâu hơn (5 phút) |
| Lần sau | Mỗi lần ~2 phút chờ | Chỉ `git push`, Vercel tự lo |
| Lịch sử thay đổi | Chỉ có ở Vercel Dashboard | Git log đầy đủ, diff được |
| Rollback | Phải `vercel rollback` CLI | 1 click trên Dashboard |
| Preview | Không có | Mỗi branch = preview URL riêng |
| Cộng tác sau này | Khó | Dễ, mời người khác vào repo |
| An toàn | OK | Tốt hơn (có PR review nếu muốn) |

Cho B'My, em khuyên dùng cách này.
