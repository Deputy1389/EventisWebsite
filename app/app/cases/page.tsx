"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
   
   
  FileCheck, 
  FileText, 
  Loader2, 
  Plus, 
  Search, 
  Shield, 
  TrendingUp 
} from "lucide-react";
import { } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Matter = {
  id: string;
  title: string;
  created_at: string;
  // Enhanced fields for Category King design
  dei?: number; // Defense Exposure Index™
  cci?: number; // Causation Confidence Index™
  riskLevel?: 'Low' | 'Med' | 'High' | 'Critical';
  pagesProcessed?: number;
  integrityScore?: number;
  lastAnalysis?: string;
};

export default function AllCasesPage() {
  const { data: session } = useSession();
  // const router = useRouter();
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
        const firmsRes = await fetch("/api/citeline/firms", { cache: "no-store" });
        if (!firmsRes.ok) return;
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) return;
        firmId = firms[0].id;
      }

      const res = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        // Mocking/Enhancing data for the redesign
        const enhanced = data.map((m: Matter) => ({
          ...m,
          dei: Math.floor(Math.random() * 40) + 40, // 40-80
          cci: Math.floor(Math.random() * 30) + 60, // 60-90
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
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Active Docket</h1>
          <p className="text-slate-400">Comprehensive overview of all active and historical litigation projects.</p>
        </div>
        <Button asChild size="lg" className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-bold shadow-lg shadow-[#C6A85E]/10">
          <Link href="/app/new-case">
            <Plus className="mr-2 h-5 w-5" />
            Initialize New Matter
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-4 md:flex-row items-center bg-[#161B22] p-4 rounded-xl border border-[#232A34]">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search Intelligence Grid..." 
            className="pl-10 bg-[#0F1217] border-[#232A34] text-white h-11" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] bg-[#0F1217] border-[#232A34] text-white h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161B22] border-[#232A34] text-white">
              <SelectItem value="dei">Highest DEI™ First</SelectItem>
              <SelectItem value="cci">Highest CCI™ First</SelectItem>
              <SelectItem value="newest">Recently Created</SelectItem>
              <SelectItem value="az">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#C6A85E]" />
          <p className="mt-4 text-slate-400 font-medium">Loading Intelligence Layers...</p>
        </div>
      ) : filteredMatters.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-[#232A34] rounded-3xl">
          <FileText className="mx-auto h-16 w-12 text-slate-700 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Intelligence Matches</h3>
          <p className="text-slate-500">Adjust your filters or initialize a new project.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatters.map((m) => (
            <Link key={m.id} href={`/app/cases/${m.id}/review`}>
              <Card className="group relative overflow-hidden bg-[#161B22] border-[#232A34] hover:border-[#C6A85E]/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C6A85E] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-[#C6A85E] transition-colors">{m.title}</h3>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">REF: {m.id.substring(0, 8)}</p>
                    </div>
                    <Badge className={`
                      ${m.riskLevel === 'Critical' ? 'bg-[#7A1E1E] text-white' : 
                        m.riskLevel === 'High' ? 'bg-[#7A1E1E]/50 text-white' : 
                        m.riskLevel === 'Med' ? 'bg-[#C6A85E] text-black' : 
                        'bg-[#274C77] text-white'}
                      text-[10px] font-bold px-2 py-0.5
                    `}>
                      {m.riskLevel?.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0F1217] p-3 rounded-lg border border-[#232A34]">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">DEI™</p>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-white">{m.dei}</span>
                        <TrendingUp className="h-4 w-4 text-[#7A1E1E] mb-1" />
                      </div>
                    </div>
                    <div className="bg-[#0F1217] p-3 rounded-lg border border-[#232A34]">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">CCI™</p>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-white">{m.cci}</span>
                        <Shield className="h-4 w-4 text-[#274C77] mb-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-600" />
                        Pages Processed
                      </span>
                      <span className="text-white font-bold tabular-nums">{m.pagesProcessed}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileCheck size={14} className="text-[#22C55E]" />
                        Integrity Score
                      </span>
                      <span className="text-[#22C55E] font-bold">{m.integrityScore}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-3 border-t border-[#232A34] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Activity size={12} />
                        Last Intelligence Sync
                      </span>
                      <span>{m.lastAnalysis ? new Date(m.lastAnalysis).toLocaleTimeString() : 'N/A'}</span>
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
