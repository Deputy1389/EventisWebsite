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
  const range = searchParams.get("range") || "1d";
  const days = range === "7d" ? 7 : 1;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const pool = getLeadEnginePool();

  try {
    const [
      newAccountsRes,
      enrichedRes,
      qualifiedRes,
      secondaryRes,
      emailsRes,
      bySourceRes,
      topAccountsRes,
    ] = await Promise.all([
      pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM accounts WHERE created_at >= $1`,
        [since]
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM accounts
         WHERE signals->'web'->>'enriched' = 'true' AND updated_at >= $1`,
        [since]
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM accounts WHERE status = 'qualified' AND updated_at >= $1`,
        [since]
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM accounts WHERE status = 'secondary_queue' AND updated_at >= $1`,
        [since]
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(DISTINCT account_id) as count
         FROM contacts WHERE email_confidence >= 50 AND created_at >= $1`,
        [since]
      ),
      pool.query<{ source: string; count: string }>(
        `SELECT signals->'sources'->0->>'source' as source, COUNT(*) as count
         FROM accounts WHERE created_at >= $1
         GROUP BY signals->'sources'->0->>'source'`,
        [since]
      ),
      pool.query(
        `SELECT id, name, domain, city, state, icp_score,
                signals->'flags'->>'attorney_count_proxy' as attorney_count,
                signals->'flags'->>'review_count' as review_count
         FROM accounts WHERE status = 'qualified'
         ORDER BY icp_score DESC NULLS LAST LIMIT 20`
      ),
    ]);

    const newAccounts = parseInt(newAccountsRes.rows[0]?.count || "0", 10);
    const enriched = parseInt(enrichedRes.rows[0]?.count || "0", 10);

    const bySource: Record<string, number> = {};
    for (const row of bySourceRes.rows) {
      bySource[row.source || "unknown"] = parseInt(row.count, 10);
    }

    const emailFoundRate =
      newAccounts > 0
        ? Math.round((parseInt(emailsRes.rows[0]?.count || "0", 10) / newAccounts) * 100)
        : 0;

    return NextResponse.json({
      range,
      new_accounts: newAccounts,
      enriched: parseInt(enrichedRes.rows[0]?.count || "0", 10),
      qualified: parseInt(qualifiedRes.rows[0]?.count || "0", 10),
      secondary_queue: parseInt(secondaryRes.rows[0]?.count || "0", 10),
      emails_found: parseInt(emailsRes.rows[0]?.count || "0", 10),
      email_found_rate: emailFoundRate,
      by_source: {
        maps: bySource["maps"] || 0,
        justia: bySource["justia"] || 0,
        findlaw: bySource["findlaw"] || 0,
      },
      top_accounts: topAccountsRes.rows,
    });
  } catch (err) {
    console.error("[lead-engine/metrics]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
