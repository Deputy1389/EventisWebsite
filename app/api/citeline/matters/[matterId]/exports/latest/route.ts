import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ matterId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { matterId } = await params;
  const reqUrl = new URL(request.url);
  const exportMode = (reqUrl.searchParams.get("export_mode") || "").trim().toUpperCase();

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const query = exportMode ? `?export_mode=${encodeURIComponent(exportMode)}` : "";
  const backendPath = `/matters/${matterId}/exports/latest${query}`;
  const res = await fetch(`${apiUrl}${backendPath}`, {
    method: "GET",
    cache: "no-store",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", backendPath),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
