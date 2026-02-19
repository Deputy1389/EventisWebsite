import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { compare } from "bcryptjs";

function envEnabled(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const allowDemoUsers = envEnabled(
    process.env.AUTH_ALLOW_DEMO_USERS ?? process.env.NEXT_PUBLIC_AUTH_ALLOW_DEMO_USERS,
    false
);

// Demo users
const DEMO_USERS = [
    {
        id: "1",
        email: "demo@ontarus.ai",
        name: "John Doe",
        // password: "eventis123"
        passwordHash:
            "$2b$10$3CuQgIJ6s3aX0Sd66CBgaempmxD3J5aDI8ZDx7YzGWrgEAIEMLo6i",
        firmId: "7a8bf3ee1ebd48a78a42995491234ebf",
        firm: "Doe & Associates",
    },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Google,
        Apple,
        Credentials({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!allowDemoUsers) return null;

                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;

                if (!email || !password) return null;

                const user = DEMO_USERS.find(
                    (u) => u.email.toLowerCase() === email.toLowerCase()
                );
                if (!user) return null;

                const isValid = await compare(password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firmId: user.firmId,
                };
            },
        }),
    ],
});
