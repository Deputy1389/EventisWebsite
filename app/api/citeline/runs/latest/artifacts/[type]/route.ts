import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ type: string }>;
};

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
  const exportMode = type === "pdf" ? "INTERNAL" : "";
  const query = exportMode ? `?export_mode=${encodeURIComponent(exportMode)}` : "";
  const exportsPath = `/matters/${matterId}/exports/latest${query}`;
  const exportsRes = await fetch(`${apiUrl}${exportsPath}`, {
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", exportsPath),
  });

  if (!exportsRes.ok) {
    return new NextResponse(await exportsRes.text(), { status: exportsRes.status });
  }

  type LatestExport = {
    run_id: string;
    artifacts: Array<{ artifact_type: string }>;
  };

  const latestExport: LatestExport = await exportsRes.json();
  const hasArtifact = latestExport.artifacts.some(
    (artifact) => String(artifact.artifact_type || "").toLowerCase() === String(type || "").toLowerCase()
  );
  if (!hasArtifact) {
    return NextResponse.json({ error: `No committed ${type} artifact found for this matter` }, { status: 404 });
  }

  const backendPath = `/runs/${latestExport.run_id}/artifacts/${type}${query}`;
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
