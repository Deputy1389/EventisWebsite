"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Network, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";

const showDemoHint = ["1", "true", "yes", "on"].includes(
    (process.env.NEXT_PUBLIC_AUTH_ALLOW_DEMO_USERS ?? "false").toLowerCase()
);

function SignInForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/app";
    const error = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        await signIn("credentials", {
            email,
            password,
            callbackUrl,
        });

        setIsLoading(false);
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2 font-bold text-2xl text-primary">
                        <Network className="h-8 w-8" />
                        <span>Linecite</span>
                    </Link>
                    <p className="text-muted-foreground mt-2">Sign in to your workspace</p>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                Invalid email or password. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="demo@ontarus.ai"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="flex items-center space-x-2 py-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Remember my email
                                </label>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => signIn("google", { callbackUrl })}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z"
                                        fill="#EA4335"
                                    />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" onClick={() => signIn("apple", { callbackUrl })}>
                                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.96.95-2.04 1.78-3.14 1.78-1.14 0-1.54-.71-2.91-.71-1.35 0-1.84.69-2.91.71-1.07.02-2.15-.84-3.14-1.78C2.93 18.29 1 14.52 1 11.37c0-3.16 2.04-4.83 4-4.83 1.04 0 2.02.72 2.65.72.63 0 1.75-.85 3.01-.85 1.07 0 2.41.61 3.28 1.74-2.13 1.28-1.78 4.14.43 5.04-1.04 2.5-2.28 5.06-4.32 7.09zm-3.05-14.8c-.56.68-1.53 1.14-2.42 1.06-.11-.84.34-1.81.9-2.46.61-.72 1.63-1.15 2.42-1.07.11.85-.34 1.79-.9 2.47z" />
                                </svg>
                                Apple
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {showDemoHint && (
                    <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Demo Credentials</p>
                        <p>Email: <code className="text-xs bg-muted px-1 py-0.5 rounded">demo@ontarus.ai</code></p>
                        <p>Password: <code className="text-xs bg-muted px-1 py-0.5 rounded">eventis123</code></p>
                    </div>
                )}

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/pilot" className="text-primary hover:underline">
                        Request a pilot
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <SignInForm />
        </Suspense>
    );
}
