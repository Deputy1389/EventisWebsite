import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ type: string }>;
};

const EXPORTABLE_STATUSES = new Set(["success", "partial", "needs_review", "completed"]);

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const matterId = searchParams.get("matterId");

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!matterId) {
    return NextResponse.json({ error: "matterId is required" }, { status: 400 });
  }

  const apiUrl = getServerApiUrl();
  
  type Run = {
    id: string;
    status: string;
  };

  // 1. Get all runs for this matter
  const runsRes = await fetch(`${apiUrl}/matters/${matterId}/runs`, {
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", `/matters/${matterId}/runs`),
  });

  if (!runsRes.ok) {
    return new NextResponse(await runsRes.text(), { status: runsRes.status });
  }

  const runs: Run[] = await runsRes.json();
  const latestExportableRun = runs.find((r) => EXPORTABLE_STATUSES.has((r.status || "").toLowerCase()));

  if (!latestExportableRun) {
    return NextResponse.json({ error: "No exportable run found for this matter" }, { status: 404 });
  }

  // 2. Proxy the artifact download
  const query = type === "pdf" ? "?export_mode=INTERNAL" : "";
  const backendPath = `/runs/${latestExportableRun.id}/artifacts/${type}${query}`;
  const res = await fetch(`${apiUrl}${backendPath}`, {
    method: "GET",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", backendPath),
  });

  if (!res.ok) {
    return new NextResponse(await res.text(), { status: res.status });
  }

  const blob = await res.blob();
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");
  headers.set("Content-Disposition", res.headers.get("Content-Disposition") || `attachment; filename="latest_${type}"`);
  headers.set("ngrok-skip-browser-warning", "true");

  return new NextResponse(blob, {
    status: 200,
    headers,
  });
}
