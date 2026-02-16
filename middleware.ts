import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
    const isAppRoute = req.nextUrl.pathname.startsWith("/app");
    const isSignedIn = !!req.auth;

    if (isAppRoute && !isSignedIn) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
});

export const config = {
    // Only run middleware on /app routes (skip static assets and API routes)
    matcher: ["/app/:path*"],
};
