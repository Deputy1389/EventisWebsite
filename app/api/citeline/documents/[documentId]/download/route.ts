import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { documentId } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/documents/${documentId}/download`, {
    method: "GET",
    headers: withServerAuthHeaders(
      undefined,
      {
        userId: session.user.id,
        firmId: session.user.firmId,
      },
      "GET",
      `/documents/${documentId}/download`,
    ),
  });

  if (!res.ok) {
    return new NextResponse(await res.text(), { status: res.status });
  }

  const blob = await res.blob();
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${documentId}.pdf"`);

  return new NextResponse(blob, {
    status: 200,
    headers,
  });
}
