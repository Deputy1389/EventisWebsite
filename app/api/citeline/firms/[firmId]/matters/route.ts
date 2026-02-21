import { NextResponse } from "next/server";


import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ firmId: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const session = await auth();
  const { firmId } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.firmId !== firmId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/firms/${firmId}/matters`, {
    method: "GET",
    cache: "no-store",
    headers: withServerAuthHeaders(undefined, {
      userId: session.user.id,
      firmId: session.user.firmId,
    }, "GET", `/firms/${firmId}/matters`),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  console.log(">>> POST /api/citeline/firms/[firmId]/matters ROUTE HIT");
  const session = await auth();
  const { firmId } = await params;

  if (!session?.user?.id || !session?.user?.firmId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.firmId !== firmId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.text();
  const apiUrl = getServerApiUrl();
  console.log(`Creating matter at: ${apiUrl}/firms/${firmId}/matters`);
  
  try {
    const res = await fetch(`${apiUrl}/firms/${firmId}/matters`, {
      method: "POST",
      headers: withServerAuthHeaders(
        {
          "Content-Type": "application/json",
        },
        {
          userId: session.user.id,
          firmId: session.user.firmId,
        },
        "POST",
        `/firms/${firmId}/matters`
      ),
      body: payload,
    });

    if (!res.ok) {
      console.error(`Citeline matter creation failed with status ${res.status}:`, await res.text());
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (error) {
    console.error("Error connecting to Citeline backend for matter creation:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 502 });
  }
}
