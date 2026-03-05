import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeadEnginePool } from "@/lib/lead-engine-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const pool = getLeadEnginePool();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  } else {
    // Default: everything except disqualified
    conditions.push(`a.status != 'disqualified'`);
  }

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(a.name ILIKE $${params.length} OR a.domain ILIKE $${params.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const countRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM accounts a ${where}`,
      params
    );

    params.push(limit, offset);
    const dataRes = await pool.query(
      `SELECT
         a.id,
         a.name,
         a.domain,
         a.city,
         a.state,
         a.icp_score,
         a.status,
         a.updated_at,
         a.signals->'sources' as sources,
         a.signals->'flags'->>'attorney_count_proxy' as attorney_count_proxy,
         a.signals->'flags'->>'review_count' as review_count,
         a.signals->'web'->>'enriched_at' as last_enriched_at
       FROM accounts a
       ${where}
       ORDER BY a.icp_score DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      total: parseInt(countRes.rows[0]?.count || "0", 10),
      limit,
      offset,
      accounts: dataRes.rows,
    });
  } catch (err) {
    console.error("[lead-engine/accounts]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
