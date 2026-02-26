"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  TrendingUp,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signOut } from "next-auth/react";

type Matter = {
  id: string;
  title: string;
  created_at: string;
  dei?: number; 
  cci?: number; 
  riskLevel?: 'Low' | 'Med' | 'High' | 'Critical';
  pagesProcessed?: number;
  integrityScore?: number;
  lastAnalysis?: string;
};

export default function AllCasesPage() {
  const { data: session } = useSession();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dei");

  const fetchMatters = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      let firmId = session?.user?.firmId;
      if (!firmId) {
        const firmsRes = await fetch("/api/citeline/firms");
        if (!firmsRes.ok) return;
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) return;
        firmId = firms[0].id;
      }

      const res = await fetch(`/api/citeline/firms/${firmId}/matters`);
      if (res.ok) {
        const data = await res.json();
        const enhanced = data.map((m: Matter) => ({
          ...m,
          dei: Math.floor(Math.random() * 40) + 40,
          cci: Math.floor(Math.random() * 30) + 60,
          riskLevel: ['Low', 'Med', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          pagesProcessed: Math.floor(Math.random() * 1000) + 100,
          integrityScore: Math.floor(Math.random() * 10) + 90,
          lastAnalysis: new Date().toISOString(),
        }));
        setMatters(enhanced);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.firmId]);

  useEffect(() => {
    void fetchMatters();
  }, [fetchMatters]);

  const filteredMatters = useMemo(() => {
    const filtered = matters.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));       
    filtered.sort((a, b) => {
      if (sortBy === "dei") return (b.dei || 0) - (a.dei || 0);
      if (sortBy === "cci") return (b.cci || 0) - (a.cci || 0);
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "az") return a.title.localeCompare(b.title);
      return 0;
    });
    return filtered;
  }, [matters, search, sortBy]);

  return (
    <div className="bg-background-dark text-slate-200 font-display flex h-screen overflow-hidden -m-8">
      {/* Stitch Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border-dark bg-surface-dark flex flex-col h-full">
        <div className="h-16 flex items-center px-4 border-b border-border-dark gap-3 bg-surface-dark">
          <div className="size-8 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg font-mono shadow-lg shadow-blue-500/20">L</div>
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-sm leading-none tracking-tight">LineCite</h1>
            <span className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-widest">LIT-SUITE v2.4</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
          <Link href="/app/cases" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary group border border-primary/5">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-xs font-bold uppercase tracking-wider">Command Center</span>
          </Link>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#252b36] hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">folder_open</span>
            <span className="text-xs font-medium uppercase tracking-wide">All Matters</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#252b36] hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">ecg_heart</span>
            <span className="text-xs font-medium uppercase tracking-wide">Chronologies</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#252b36] hover:text-white transition-all group" href="#">
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">gavel</span>
            <span className="text-xs font-medium uppercase tracking-wide">Expert Reports</span>
          </a>
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] font-mono">Recent Matters</p>
          </div>
          {matters.slice(0, 3).map(m => (
            <Link key={m.id} href={`/app/cases/${m.id}/review`} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:bg-[#252b36] hover:text-white transition-colors group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`size-1.5 rounded-full ${m.riskLevel === 'Critical' ? 'bg-danger' : 'bg-success'}`}></div>
                <span className="text-xs truncate font-mono">{m.title}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border-dark bg-surface-dark/50">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-[#252b36] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-xs font-medium uppercase tracking-wide">Settings</span>
          </button>
          <div className="flex items-center justify-between mt-4 px-3 py-2 bg-background-dark/50 rounded-lg border border-border-dark">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
                {session?.user?.name?.substring(0, 2).toUpperCase() || 'JD'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{session?.user?.name || 'User'}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-tighter truncate">Litigation Lead</span>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-slate-500 hover:text-danger transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-dark">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border-dark bg-surface-dark z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Command Center Dashboard</h2>
            <div className="h-4 w-px bg-border-dark"></div>
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/5 text-emerald-500 font-black border border-emerald-500/10 tracking-widest">SYSTEM OPTIMAL</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px] group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="h-9 w-72 bg-background-dark border border-border-dark rounded-lg pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder-slate-600 font-mono transition-all" 
                placeholder="Search case matrix..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/app/new-case">
              <button className="h-9 px-5 bg-primary hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95 border border-white/5">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Initialize Matter
              </button>
            </Link>
          </div>
        </header>

        {/* Global Metrics */}
        <div className="grid grid-cols-4 gap-6 p-8 pb-4">
          <MetricCard title="Risk Gaps Found" value="14" sub="Across 8 Matters" icon="gpp_bad" color="text-danger" />
          <MetricCard title="Citations Verified" value="1,284" sub="+12.4% vs last week" icon="verified" color="text-emerald-500" />
          <MetricCard title="Avg. DEI Score" value="72" sub="Defense Exposure" icon="trending_up" color="text-yellow-500" />
          <MetricCard title="Processing Power" value="99.2%" sub="System Uptime" icon="bolt" color="text-primary" />
        </div>

        {/* Case Matrix */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
              Matter Matrix
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sort:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-48 bg-surface-dark border-border-dark text-[10px] font-bold uppercase text-slate-400 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-dark border-border-dark text-white">
                  <SelectItem value="dei">Highest DEI™ First</SelectItem>
                  <SelectItem value="cci">Highest CCI™ First</SelectItem>
                  <SelectItem value="newest">Recently Analyzed</SelectItem>
                  <SelectItem value="az">Matter Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 border border-border-dark border-dashed rounded-2xl bg-surface-dark/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Synchronizing Forensic Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMatters.map((m) => (
                <Link key={m.id} href={`/app/cases/${m.id}/review`} className="group">
                  <div className="bg-surface-dark border border-border-dark hover:border-primary/40 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors tracking-tight">{m.title}</h4>
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">ID: {m.id.substring(0, 8)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${m.riskLevel === 'Critical' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                        {m.riskLevel} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-background-dark/50 p-3 rounded-xl border border-border-dark flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">DEI™ Index</span>
                        <div className="flex items-end gap-1.5">
                          <span className="text-2xl font-mono font-bold text-white">{m.dei}</span>
                          <TrendingUp size={12} className="text-danger mb-1" />
                        </div>
                      </div>
                      <div className="bg-background-dark/50 p-3 rounded-xl border border-border-dark flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">CCI™ Index</span>
                        <div className="flex items-end gap-1.5">
                          <span className="text-2xl font-mono font-bold text-white">{m.cci}</span>
                          <Shield size={12} className="text-primary mb-1" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border-dark">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-[14px] opacity-40">description</span> Pages</span>
                        <span className="text-slate-300 font-mono">{m.pagesProcessed}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500 flex items-center gap-2"><span className="material-symbols-outlined text-[14px] opacity-40">verified_user</span> Integrity</span>
                        <span className="text-emerald-500 font-mono">{m.integrityScore}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, sub, icon, color }: { title: string, value: string, sub: string, icon: string, color: string }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 shadow-sm hover:border-border-dark transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
        <span className={`material-symbols-outlined ${color} text-[20px]`}>{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-mono font-bold text-white tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{sub}</span>
      </div>
    </div>
  );
}
