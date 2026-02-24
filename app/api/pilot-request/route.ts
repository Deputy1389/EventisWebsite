import { NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/citeline";
import { Resend } from "resend";



export async function POST(request: Request) {
    try {
        const data = await request.json();
        const apiUrl = getServerApiUrl();
        const hipaaStrict = ["1", "true", "yes", "on"].includes(
            (process.env.HIPAA_ENFORCEMENT || process.env.NEXT_PUBLIC_HIPAA_ENFORCEMENT || "false").toLowerCase()
        );

        // 1. Create firm in Citeline backend
        if (!hipaaStrict) {
            try {
                const citelineRes = await fetch(`${apiUrl}/firms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: data.firmName }),
                });

                if (citelineRes.ok) {
                    const firm = await citelineRes.json();
                    console.log("Created firm in Citeline:", firm.id);
                }
            } catch (err) {
                console.error("Backend firm creation failed:", err);
            }
        }

        // 2. Send Email Notification via Resend
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: "Linecite Pilot <onboarding@linecite.com>",
                to: "patrick@linecite.com",
                subject: `New Pilot Request: ${data.firmName}`,
                html: `
                    <h2>New Pilot Request Received</h2>
                    <p><strong>Firm Name:</strong> ${data.firmName}</p>
                    <p><strong>Contact Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Requested Volume:</strong> ${data.volume || "Not specified"}</p>
                    <br/>
                    <hr/>
                    <p><small>This request was automatically processed and a firm record was attempted in the backend.</small></p>
                `,
            });
            console.log("Pilot notification email sent to patrick@linecite.com");
        } else {
            console.warn("RESEND_API_KEY not found. Skipping email notification.");
            // Log to console so the data isn't lost
            console.log("PILOT DATA:", JSON.stringify(data, null, 2));
        }

        return NextResponse.json({ success: true, message: "Request received" });
    } catch (error) {
        console.error("Error in pilot-request:", error);
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        );
    }
}
