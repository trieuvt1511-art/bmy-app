#!/usr/bin/env bash
# B'My — setup-github.sh
# Chạy 1 lần duy nhất để publish repo v9 lên GitHub và kết nối Vercel.
#
# Yêu cầu:
#   - gh CLI (brew install gh)
#   - Đang cd trong folder yumgo-app-v9-content
#
# Sau khi chạy xong lần này, mỗi lần deploy tiếp theo anh chỉ cần
# chạy scripts/redeploy.sh "tin nhắn commit".

set -euo pipefail

REPO_NAME="${REPO_NAME:-bmy-app}"
REPO_VISIBILITY="${REPO_VISIBILITY:-private}"   # private | public

echo ""
echo "━━━ B'My GitHub setup ━━━"
echo ""

# 1. Kiểm tra gh
if ! command -v gh >/dev/null 2>&1; then
  echo "✗ 'gh' chưa được cài. Cài bằng:  brew install gh"
  exit 1
fi

# 2. Kiểm tra đang ở đúng folder
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
  echo "✗ Không thấy package.json / app/. Hãy 'cd yumgo-app-v9-content' trước."
  exit 1
fi

# 3. Auth GitHub nếu chưa
if ! gh auth status >/dev/null 2>&1; then
  echo "→ Đăng nhập GitHub (một cửa sổ trình duyệt sẽ mở)..."
  gh auth login -p https -w
fi

# 4. Git init (nếu chưa có)
if [ ! -d ".git" ]; then
  git init -q -b main
  git add -A
  git -c commit.gpgsign=false commit -q -m "B'My v9: initial commit"
fi

# 5. Tạo repo trên GitHub và push
if git remote get-url origin >/dev/null 2>&1; then
  echo "→ Remote 'origin' đã tồn tại: $(git remote get-url origin)"
  git push -u origin main
else
  echo "→ Tạo repo GitHub '$REPO_NAME' ($REPO_VISIBILITY) và push..."
  gh repo create "$REPO_NAME" \
    --"$REPO_VISIBILITY" \
    --source=. \
    --remote=origin \
    --push \
    --description "B'My — Vietnamese food web app (Madrid)"
fi

echo ""
echo "✓ Xong. Repo đã có trên GitHub."
echo ""
echo "━━━ Bước cuối: kết nối Vercel với repo ━━━"
echo ""
echo "  1. Mở https://vercel.com/new"
echo "  2. Chọn repo '$REPO_NAME' vừa tạo và bấm Import"
echo "  3. Vercel tự detect Next.js. Bấm Deploy (chưa cần env vars cũng deploy được)."
echo "  4. Vào Project → Settings → Environment Variables, thêm:"
echo "       - GROQ_API_KEY      (từ https://console.groq.com)"
echo "       - KV_REST_API_URL   (từ Storage → Create KV)"
echo "       - KV_REST_API_TOKEN (từ Storage → Create KV)"
echo "       - CRON_SECRET       (sinh bằng: openssl rand -hex 32)"
echo "  5. Bấm Redeploy để Vercel load env vars mới."
echo ""
echo "Từ bây giờ mỗi lần muốn đẩy bản mới, anh chỉ cần chạy:"
echo "  ./scripts/redeploy.sh \"mô tả thay đổi\""
echo ""
