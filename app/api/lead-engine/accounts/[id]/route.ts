import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeadEnginePool } from "@/lib/lead-engine-db";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_STATUSES = [
  "new", "qualified", "secondary_queue", "needs_manual_research",
  "disqualified", "active_outreach", "engaged", "paused",
];

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getLeadEnginePool();

  try {
    const accountRes = await pool.query(
      `SELECT id, name, website, domain, city, state, icp_score, status, signals, created_at, updated_at
       FROM accounts WHERE id = $1`,
      [id]
    );

    if (accountRes.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contactsRes = await pool.query(
      `SELECT id, name, role, email, email_confidence, status, created_at
       FROM contacts WHERE account_id = $1 ORDER BY email_confidence DESC`,
      [id]
    );

    return NextResponse.json({
      account: accountRes.rows[0],
      contacts: contactsRes.rows,
    });
  } catch (err) {
    console.error("[lead-engine/accounts/:id GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pool = getLeadEnginePool();

  let body: { status?: string; disqual_reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, disqual_reason } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Handle suppression: if status is being set to disqualified with a domain-level reason,
    // also insert into suppression_list if that table exists.
    await pool.query(
      `UPDATE accounts SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );

    if (status === "disqualified" && disqual_reason) {
      // Store disqual_reason in signals.sniper.reasons
      await pool.query(
        `UPDATE accounts
         SET signals = jsonb_set(
           COALESCE(signals, '{}'),
           '{sniper,disqual_reason}',
           $1::jsonb
         ),
         updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(disqual_reason), id]
      );
    }

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("[lead-engine/accounts/:id POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
