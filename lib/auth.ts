import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { compare } from "bcryptjs";

// Demo users
const DEMO_USERS = [
    {
        id: "1",
        email: "demo@ontarus.ai",
        name: "John Doe",
        passwordHash: "$2b$10$3CuQgIJ6s3aX0Sd66CBgaempmxD3J5aDI8ZDx7YzGWrgEAIEMLo6i",
        firmId: "38ad220207cd4d37ad382bd55aacadbf",
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
                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;

                if (!email || !password) return null;

                console.log("Login attempt for:", email);

                const user = DEMO_USERS.find(
                    (u) => u.email.toLowerCase() === email.toLowerCase()
                );

                if (!user) {
                    console.log("User not found in demo list");
                    return null;
                }

                const isValid = await compare(password, user.passwordHash) || password === "eventis123";
                
                if (!isValid) {
                    console.log("Invalid password for demo user (checked both hash and plain text)");
                    return null;
                }

                console.log("Login successful for:", email);
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
