import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Create firm in Citeline
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
