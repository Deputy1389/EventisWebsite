import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ matterId: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { matterId } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/matters/${matterId}`, {
    method: "GET",
    cache: "no-store",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", `/matters/${matterId}`),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { matterId } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/matters/${matterId}`, {
    method: "DELETE",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "DELETE", `/matters/${matterId}`),
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
