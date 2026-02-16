"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignInForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/app";
    const error = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

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
                        <span>Eventis</span>
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
                                    placeholder="demo@eventis.ai"
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo credentials hint */}
                <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Demo Credentials</p>
                    <p>Email: <code className="text-xs bg-muted px-1 py-0.5 rounded">demo@eventis.ai</code></p>
                    <p>Password: <code className="text-xs bg-muted px-1 py-0.5 rounded">eventis123</code></p>
                </div>

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
