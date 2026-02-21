import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ runId: string; type: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { runId, type } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/runs/${runId}/artifacts/${type}`, {
    method: "GET",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", `/runs/${runId}/artifacts/${type}`),
  });

  if (!res.ok) {
    return new NextResponse(await res.text(), { status: res.status });
  }

  // Forward the file blob with correct headers
  const blob = await res.blob();
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");
  headers.set("Content-Disposition", res.headers.get("Content-Disposition") || `attachment; filename="artifact_${type}"`);

  return new NextResponse(blob, {
    status: 200,
    headers,
  });
}
