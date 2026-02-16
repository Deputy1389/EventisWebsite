import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Demo users — replace with a real database lookup later.
// Passwords are bcrypt hashes.  Use `npx bcryptjs <password>` to generate new ones.
const DEMO_USERS = [
    {
        id: "1",
        email: "demo@eventis.ai",
        name: "John Doe",
        // password: "eventis123"
        passwordHash:
            "$2b$10$ApC5UwkzStE20Rq70bVJieFCV93D7OpSgdC1qUS6sZkb4dQEzAgN.",
        firm: "Doe & Associates",
    },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
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

                return { id: user.id, email: user.email, name: user.name };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
