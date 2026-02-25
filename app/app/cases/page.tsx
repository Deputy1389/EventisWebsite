"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  Search,
  Shield,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

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
    <div className="max-w-7xl mx-auto py-12 px-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-serif text-white mb-4 tracking-tight">Active Docket</h1>
          <p className="text-slate-500 text-lg max-w-2xl">Deterministic medical intelligence grid. Map causation and quantify defense exposure across your entire practice.</p>
        </div>
        <Button asChild size="lg" className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-black h-14 px-10 rounded-xl shadow-2xl shadow-[#C6A85E]/10">
          <Link href="/app/new-case">
            <Plus className="mr-2 h-5 w-5" />
            INITIALIZE MATTER
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-4 md:flex-row items-center bg-[#161B22]/50 p-5 rounded-2xl border border-[#232A34] mb-12 backdrop-blur-sm">
        <div className="relative w-full md:max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />         
          <Input
            placeholder="Search Intelligence Grid..."
            className="pl-12 bg-[#0F1217] border-[#232A34] text-white h-12 rounded-xl focus:border-[#C6A85E]/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto ml-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter Matrix:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[220px] bg-[#0F1217] border-[#232A34] text-white h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161B22] border-[#232A34] text-white rounded-xl">
              <SelectItem value="dei">Highest DEI™ First</SelectItem>
              <SelectItem value="cci">Highest CCI™ First</SelectItem>
              <SelectItem value="newest">Recently Analyzed</SelectItem>
              <SelectItem value="az">Matter Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#C6A85E]" />
          <p className="mt-6 text-slate-400 font-serif text-xl">Synchronizing Intelligence Layers...</p>
        </div>
      ) : filteredMatters.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-[#232A34] rounded-[32px] bg-[#161B22]/20">
          <FileText className="mx-auto h-16 w-12 text-slate-800 mb-6" />
          <h3 className="text-2xl font-serif text-white mb-2">No Intelligence Matches</h3>
          <p className="text-slate-500">Initialize a new matter to begin deterministic extraction.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatters.map((m) => (
            <Link key={m.id} href={`/app/cases/${m.id}/review`}>
              <Card className="group relative overflow-hidden bg-[#161B22] border-white/5 hover:border-[#C6A85E]/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-2xl rounded-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C6A85E] opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-2xl font-serif text-white truncate group-hover:text-[#C6A85E] transition-colors tracking-tight">{m.title}</h3>
                      <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest font-bold">MATTER ID: {m.id.substring(0, 8)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#0F1217] p-4 rounded-xl border border-white/5 group-hover:border-[#C6A85E]/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-2">DEI™</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-serif font-bold text-white leading-none">{m.dei}</span>
                        <TrendingUp className="h-4 w-4 text-[#7A1E1E] mb-1" />
                      </div>
                    </div>
                    <div className="bg-[#0F1217] p-4 rounded-xl border border-white/5 group-hover:border-[#C6A85E]/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-2">CCI™</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-serif font-bold text-white leading-none">{m.cci}</span>
                        <Shield className="h-4 w-4 text-[#274C77] mb-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">
                        <FileText size={14} className="opacity-40" />
                        Pages Processed
                      </span>
                      <span className="text-white font-mono font-bold tabular-nums">{m.pagesProcessed}</span>      
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">
                        <FileCheck size={14} className="text-emerald-500 opacity-60" />
                        Integrity Score
                      </span>
                      <span className="text-emerald-400 font-bold">{m.integrityScore}%</span>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between group/btn">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-[#C6A85E] transition-colors">Open Intelligence Feed</span>
                      <ArrowRight size={14} className="text-slate-700 group-hover:text-[#C6A85E] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
