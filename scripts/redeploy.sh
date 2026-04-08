#!/usr/bin/env bash
# B'My — redeploy.sh
# Push thay đổi mới lên GitHub. Vercel sẽ tự build + deploy sau ~1 phút.
#
# Cách dùng:
#   ./scripts/redeploy.sh "thay menu Bánh Mì Chay"
#   ./scripts/redeploy.sh                 # tự sinh message với timestamp

set -euo pipefail

MSG="${1:-"update $(date +%Y-%m-%d\ %H:%M)"}"

if [ ! -d ".git" ]; then
  echo "✗ Chưa có .git. Chạy scripts/setup-github.sh trước."
  exit 1
fi

# Nếu không có gì để commit
if git diff --quiet && git diff --cached --quiet; then
  echo "→ Không có thay đổi nào."
  echo "  (Nếu anh muốn force redeploy, vào Vercel Dashboard → Deployments → ⋯ → Redeploy)"
  exit 0
fi

git add -A
git -c commit.gpgsign=false commit -m "$MSG"
git push

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
echo ""
echo "✓ Đã push. Vercel sẽ tự deploy trong 1–2 phút."
if [ -n "$REMOTE_URL" ]; then
  echo "  Theo dõi tại: https://vercel.com/dashboard"
fi
echo ""
