import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.firmId = user.firmId as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.firmId = token.firmId as string;
            }
            return session;
        },
    },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
