import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

type RouteParams = {
  params: Promise<{ runId: string; filename: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { runId, filename } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const encodedFilename = encodeURIComponent(filename);
  const res = await fetch(`${apiUrl}/runs/${runId}/artifacts/by-name/${encodedFilename}`, {
    method: "GET",
    cache: "no-store",
    headers: withServerAuthHeaders(
      undefined,
      {
        userId: session.user.id,
        firmId: session.user.firmId,
      },
      "GET",
      `/runs/${runId}/artifacts/by-name/${filename}`,
    ),
  });

  if (!res.ok) {
    return new NextResponse(await res.text(), { status: res.status });
  }

  const blob = await res.blob();
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");
  headers.set(
    "Content-Disposition",
    res.headers.get("Content-Disposition") || `attachment; filename="${filename}"`,
  );

  return new NextResponse(blob, {
    status: 200,
    headers,
  });
}

