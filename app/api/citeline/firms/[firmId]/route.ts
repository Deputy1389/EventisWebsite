import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { firmId: string } }
) {
  const session = await auth();
  const { firmId } = await params;
  const body = await req.json();

  const apiUrl = getServerApiUrl();

  const headers = withServerAuthHeaders({ "Content-Type": "application/json" }, {
    userId: session?.user?.id || "system",
    firmId: firmId,
  }, "PATCH", `/firms/${firmId}`);

  const res = await fetch(`${apiUrl}/firms/${firmId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
