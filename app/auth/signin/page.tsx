"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/app/cases",
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/app/cases" });
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 -m-8">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="flex items-center gap-3 text-white group">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
              <Icon name="balance" className="text-2xl" />
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">LineCite</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Deterministic Forensic Intelligence</p>
          </div>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
              <p className="text-sm text-slate-500 mt-2">Enter your credentials to access the command center.</p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn("apple")}
                className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-dark"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-surface-dark px-4 text-slate-600">Or continue with email</span></div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Practice Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. partner@litigation.law"
                  className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Secure Key</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 rounded border-border-dark bg-background-dark text-primary focus:ring-primary/20"
                  />
                  <span className="text-xs text-slate-500">Remember this device</span>
                </label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot key?</a>
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center py-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 mt-6 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
                Authorize Session
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          Limited access for verified plaintiff-side firms only.
        </p>
      </div>
    </div>
  );
}
