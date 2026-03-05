import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse("Webhook Error: " + error.message, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    if (!session?.metadata?.userId || !session?.metadata?.firmId) {
      return new NextResponse("User ID and Firm ID are required in metadata", { status: 400 });
    }

    const { userId, firmId, plan } = session.metadata;

    console.log(`Payment success for user: ${userId}, firm: ${firmId}, plan: ${plan}`);

    // Update the firm tier in Citeline API
    try {
      const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // We call our own internal proxy or the backend directly
      // Since this is a webhook, we use a system-level update
      const updateRes = await fetch(`${apiUrl}/firms/${firmId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Auth": "true", // Backend should verify this if it's internal
        },
        body: JSON.stringify({
          status: "paid",
          tier: plan,
        }),
      });

      if (!updateRes.ok) {
        console.error(`Failed to update firm tier: ${updateRes.statusText}`);
      } else {
        console.log(`Firm ${firmId} successfully upgraded to ${plan}`);
      }
    } catch (err) {
      console.error("Error updating firm via API:", err);
    }
  }

  return new NextResponse(null, { status: 200 });
}
