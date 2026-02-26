"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Gavel, Loader2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 -m-8">
      <div className="w-full max-w-md space-y-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="flex items-center gap-3 text-white group">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">balance</span>
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">LineCite</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Deterministic Forensic Intelligence</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-dark border border-border-dark rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
              <p className="text-sm text-slate-500 mt-2">Enter your credentials to access the command center.</p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Practice Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. partner@litigation.law" 
                  className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Secure Key</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-700"
                />
              </div>

              <button 
                type="button"
                onClick={() => { setLoading(true); signIn('google', { callbackUrl: '/app/cases' }); }}
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
                Authorize Session
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-dark"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-surface-dark px-4 text-slate-600">Secure Protocol</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-background-dark/50 border border-border-dark/50 text-center space-y-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">SOC2 Type II<br/>Compliant</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-background-dark/50 border border-border-dark/50 text-center space-y-2">
                <Gavel size={18} className="text-primary" />
                <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Admissibility<br/>Verified</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          Limited access for verified plaintiff-side firms only.
        </p>
      </div>
    </div>
  );
}
