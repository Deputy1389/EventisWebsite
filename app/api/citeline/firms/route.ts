import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

export async function GET(_: Request) {
  const session = await auth();

  // Allow unauthenticated requests to list firms
  // The backend will filter based on the identity headers
  const apiUrl = getServerApiUrl();

  const headers = session?.user?.id
    ? withServerAuthHeaders(undefined, {
        userId: session.user.id,
        firmId: session.user.firmId,
      }, "GET", "/firms")
    : { "Content-Type": "application/json" };

  const res = await fetch(`${apiUrl}/firms`, {
    method: "GET",
    cache: "no-store",
    headers,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
