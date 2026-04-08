// GET /api/trending → { items, refreshedAt }
// Public, read-only. Used by the /blog page to show latest trending.

import { getTrending, getLastRefreshedAt } from "@/lib/trendingStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [items, refreshedAt] = await Promise.all([
    getTrending(),
    getLastRefreshedAt(),
  ]);
  return Response.json({ items, refreshedAt });
}
