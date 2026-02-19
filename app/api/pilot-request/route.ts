import { NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/citeline";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const apiUrl = getServerApiUrl();
        const hipaaStrict = ["1", "true", "yes", "on"].includes(
            (process.env.HIPAA_ENFORCEMENT || process.env.NEXT_PUBLIC_HIPAA_ENFORCEMENT || "false").toLowerCase()
        );

        // Create firm in Citeline
        if (!hipaaStrict) {
            console.log("----- SENDING TO CITELINE -----");
            const citelineRes = await fetch(`${apiUrl}/firms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: data.firmName }),
            });

            if (citelineRes.ok) {
                const firm = await citelineRes.json();
                console.log("Created firm in Citeline:", firm.id);
            } else {
                console.warn("Failed to create firm in Citeline", await citelineRes.text());
            }
        }

        // In a real app, this would also save to a database or send an email.
        console.log("----- NEW PILOT REQUEST -----");
        console.log(JSON.stringify(data, null, 2));
        console.log("-----------------------------");

        return NextResponse.json({ success: true, message: "Request received" });
    } catch (error) {
        console.error("Error in pilot-request:", error);
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        );
    }
}
