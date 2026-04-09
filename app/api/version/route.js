// /api/version — trả về build signature để xác nhận Vercel đã deploy commit nào.
//
// Vercel tự set process.env.VERCEL_GIT_COMMIT_SHA khi build.
// Ngoài ra trả thêm 1 signature constant để em verify bundle mới thực sự đang chạy.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// BUMP mỗi khi cần kiểm tra deploy
const BUILD_SIGNATURE = "sha1-id-migration-v1";

export async function GET() {
  return Response.json({
    buildSignature: BUILD_SIGNATURE,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    commitShaShort: (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7),
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || "",
    commitRef: process.env.VERCEL_GIT_COMMIT_REF || "",
    deployedAt: new Date().toISOString(),
    env: process.env.VERCEL_ENV || "local",
    region: process.env.VERCEL_REGION || "local",
  });
}
