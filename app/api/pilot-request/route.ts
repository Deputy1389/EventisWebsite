import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // In a real app, this would save to a database or send an email.
        console.log("----- NEW PILOT REQUEST -----");
        console.log(JSON.stringify(data, null, 2));
        console.log("-----------------------------");

        return NextResponse.json({ success: true, message: "Request received" });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        );
    }
}
