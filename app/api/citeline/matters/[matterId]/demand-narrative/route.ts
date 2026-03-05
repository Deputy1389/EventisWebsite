import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";
import { getFirmId } from "@/lib/get-firm-id";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ matterId: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  const { matterId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const firmId = await getFirmId(session);
  const body = await req.text();

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/matters/${matterId}/demand-narrative`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withServerAuthHeaders(undefined, { userId: session.user.id, firmId: firmId || "" }, "POST", `/matters/${matterId}/demand-narrative`),
    },
    body,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
