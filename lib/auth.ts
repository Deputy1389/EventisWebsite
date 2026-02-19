import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Demo users
const DEMO_USERS = [
    {
        id: "1",
        email: "demo@eventis.ai",
        name: "John Doe",
        // password: "eventis123"
        passwordHash:
            "$2b$10$ApC5UwkzStE20Rq70bVJieFCV93D7OpSgdC1qUS6sZkb4dQEzAgN.",
        firmId: "7a8bf3ee1ebd48a78a42995491234ebf",
        firm: "Doe & Associates",
    },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
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
