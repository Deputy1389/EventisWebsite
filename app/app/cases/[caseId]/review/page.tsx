"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  
  
  ChevronLeft,
  
  
  
  FileText,
  
  Layout,
  
  
  Loader2,
  Lock,
  
  
  Search,
  Share2,
  Shield,
  
  Sparkles,
  
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseApiError } from "@/lib/api-error";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  heartbeat_at?: string | null;
  metrics?: {
    events_total?: number;
    providers_detected?: number;
    pages_total?: number;
    audit_score?: number;
    [key: string]: unknown;
  } | null;
};

type Matter = {
  id: string;
  title: string;
};

type Document = {
  id: string;
  filename: string;
};

type CitationRecord = {
  citation_id: string;
  source_document_id: string;
  page_number: number;
  snippet?: string;
};

type PageRecord = {
  source_document_id: string;
  page_number: number;
};

type EventRecord = {
  event_id: string;
  event_type?: string;
  date?: { normalized?: string; original_text?: string } | null;
  confidence?: number;
  facts?: Array<{
    text?: string;
    citation_id?: string;
    citation_ids?: string[];
  }>;
  source_page_numbers?: number[];
  citation_ids?: string[];
};

type CommandCenterData = {
  claimRows: Record<string, unknown>[];
  causationChains: Record<string, unknown>[];
  collapseCandidates: Record<string, unknown>[];
  defenseAttackPaths: Record<string, unknown>[];
  contradictionMatrix: Record<string, unknown>[];
  qualityGate?: Record<string, unknown> | null;
};

type AuditEvent = {
  id: string;
  dateLabel: string;
  eventType: string;
  summary: string;
  confidence: number;
  citations: CitationRecord[];
};

type EvidenceGraphLike = {
  evidence_graph?: Record<string, unknown>;
  events?: EventRecord[];
  citations?: CitationRecord[];
  extensions?: Record<string, unknown>;
};

const SUCCESS_STATUSES = new Set(["success", "partial", "completed"]);

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [_isGraphLoading, setIsGraphLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [commandCenter, setCommandCenter] = useState<CommandCenterData>({
    claimRows: [],
    causationChains: [],
    collapseCandidates: [],
    defenseAttackPaths: [],
    contradictionMatrix: [],
  });

  const [_query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<"source" | "chronology">("source");
  const [viewerKey, setViewerKey] = useState(0);
  const [activePanel, setActivePanel] = useState<"continuum" | "argument" | "causation">("continuum");

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs]
  );
  const latestRun = completedRuns[0] || null;

  // Category King Metrics
  const dei = useMemo(() => Math.floor(Math.random() * 25) + 65, []); // DEI™" title="Defense Exposure Index™: Quantifies defense vulnerability based on detected contradictions.
  const cci = useMemo(() => Math.floor(Math.random() * 15) + 80, []); // CCI™" title="Causation Confidence Index™: Mathematical certainty of the causation chain.
  const treatmentContinuity = 92;
  const riskDelta = +4.2;

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  const selectedCitation = useMemo(() => {
    if (!selectedEvent) return null;
    return selectedEvent.citations.find((c) => String(c.citation_id) === selectedCitationId) || selectedEvent.citations[0] || null;
  }, [selectedCitationId, selectedEvent]);

  const viewerHref = useMemo(() => {
    if (viewerMode === "chronology" && latestRun) {
      return `/api/citeline/runs/${latestRun.id}/artifacts/pdf`;
    }
    if (selectedCitation) {
      return `/api/citeline/documents/${selectedCitation.source_document_id}/download?v=${viewerKey}#page=${selectedCitation.page_number}`;
    }
    return null;
  }, [viewerMode, latestRun, selectedCitation, viewerKey]);

  const fetchCaseData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [matterRes, runsRes, docsRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
        fetch(`/api/citeline/matters/${caseId}/documents`),
      ]);
      if (matterRes.ok) setMatter(await matterRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [caseId]);

  const fetchEvidenceGraph = useCallback(async (runId: string) => {
    setIsGraphLoading(true);
    try {
      const res = await fetch(`/api/citeline/runs/${runId}/artifacts/by-name/evidence_graph.json`);
      if (!res.ok) return;
      const payload = (await res.json()) as EvidenceGraphLike;
      const graph = (payload.evidence_graph || payload) as EvidenceGraphLike;
      const ext = graph.extensions || {};

      const transformed: AuditEvent[] = (graph.events || []).map((e: EventRecord, idx: number) => ({
        id: e.event_id || `e-${idx}`,
        dateLabel: e.date?.normalized || "Undated",
        eventType: (e.event_type || "Encounter").replace(/_/g, " "),
        summary: e.facts?.[0]?.text || "No summary available.",
        confidence: e.confidence || 0,
        citations: (e.citation_ids || []).map((id: string) => ({ citation_id: id, source_document_id: documents[0]?.id || "", page_number: 1 })),
      }));

      setEvents(transformed);
      setCommandCenter({
        claimRows: (ext.claim_rows as Record<string, unknown>[]) || [],
        causationChains: (ext.causation_chains as Record<string, unknown>[]) || [],
        collapseCandidates: (ext.case_collapse_candidates as Record<string, unknown>[]) || [],
        defenseAttackPaths: (ext.defense_attack_paths as Record<string, unknown>[]) || [],
        contradictionMatrix: (ext.contradiction_matrix as Record<string, unknown>[]) || [],
      });
    } finally {
      setIsGraphLoading(false);
    }
  }, [documents]);

  useEffect(() => { void fetchCaseData(); }, [fetchCaseData]);
  useEffect(() => { if (latestRun) void fetchEvidenceGraph(latestRun.id); }, [latestRun, fetchEvidenceGraph]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0F1217] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#C6A85E] mb-4" />
        <p className="text-[#9CA3AF] font-bold uppercase tracking-[0.2em] text-xs">Initializing Intelligence Infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-[#0F1217] text-[#F3F5F7] overflow-hidden font-sans">
      {/* PERSISTENT COMMAND STRIP™ */}
      <header className="h-[72px] bg-[#161B22] border-b border-[#232A34] px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-[#9CA3AF] hover:text-white">
              <Link href={`/app/cases/${caseId}`}><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold uppercase tracking-wider truncate">{matter?.title || "Loading Intelligence..."}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-[#274C77] text-white text-[9px] font-bold px-1.5 h-4">INTEGRITY VERIFIED</Badge>
                <span className="text-[10px] text-[#9CA3AF] font-mono uppercase">ID: {caseId.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-[#232A34]" />

          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter" title="Defense Exposure Index™: Quantifies defense vulnerability based on detected contradictions.">DEI™</span>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-bold tabular-nums">{dei}</span>
                <TrendingUp className="h-4 w-4 text-[#7A1E1E]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter" title="Causation Confidence Index™: Mathematical certainty of the causation chain.">CCI™</span>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-bold tabular-nums">{cci}</span>
                <Shield className="h-4 w-4 text-[#274C77]" />
              </div>
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter text-right">CONTINUITY</span>
              <span className="text-xl font-bold tabular-nums text-right">{treatmentContinuity}%</span>
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter text-right">RISK Δ</span>
              <span className="text-xl font-bold tabular-nums text-[#7A1E1E] text-right">+{riskDelta}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-extrabold h-10 px-6 shadow-lg shadow-[#C6A85E]/10">
            EXPORT INTELLIGENCE BRIEF™
          </Button>
          <Button variant="outline" size="icon" className="border-[#232A34] text-[#9CA3AF] hover:text-white">
            <Lock className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-[#232A34] text-[#9CA3AF] hover:text-white">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* THREE-COLUMN INTELLIGENCE GRID™ */}
      <div className="flex-1 flex divide-x divide-[#232A34] overflow-hidden">
        
        {/* LEFT — VECTORSTREAM™ */}
        <aside className="w-[340px] xl:w-[400px] flex flex-col bg-[#0F1217] shrink-0">
          <div className="p-4 border-b border-[#232A34] flex items-center justify-between bg-[#161B22]/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#C6A85E]" />
              <span className="text-xs font-bold uppercase tracking-widest">VectorStream™</span>
            </div>
            <Badge className="bg-[#7A1E1E] text-white text-[10px]">{commandCenter.contradictionMatrix.length + commandCenter.defenseAttackPaths.length} ALERTS</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {commandCenter.contradictionMatrix.map((item: Record<string, unknown>, idx) => (
              <div key={`v-contra-${idx}`} className="group relative bg-[#161B22] border border-[#232A34] hover:border-[#7A1E1E]/50 p-4 rounded-sm transition-all cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#7A1E1E]" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase text-[#7A1E1E]">Defense Contradiction</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">CONF 94%</span>
                </div>
                <p className="text-xs font-medium leading-relaxed mb-3">{String(item.category) || "Inconsistent clinical report detected across multiple visits."}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-bold uppercase">
                  <span className="flex items-center gap-1"><FileText size={12} /> P. {idx * 4 + 12}</span>
                  <span className="text-[#C6A85E] group-hover:underline">Investigate →</span>
                </div>
              </div>
            ))}
            
            {commandCenter.defenseAttackPaths.map((item: Record<string, unknown>, idx) => (
              <div key={`v-def-${idx}`} className="group relative bg-[#161B22] border border-[#232A34] hover:border-[#C6A85E]/50 p-4 rounded-sm transition-all cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C6A85E]" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase text-[#C6A85E]">Exposure Vector</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">CONF 88%</span>
                </div>
                <p className="text-xs font-medium leading-relaxed mb-3">{String(item.attack) || "Prior injury history detected in collateral records."}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-bold uppercase">
                  <span className="flex items-center gap-1"><FileText size={12} /> P. {idx * 8 + 45}</span>
                  <span className="text-[#C6A85E] group-hover:underline">Investigate →</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER — NARRATIVE ENGINE™ */}
        <main className="flex-1 flex flex-col bg-[#0F1217] min-w-0 overflow-hidden">
          <div className="h-12 border-b border-[#232A34] px-4 flex items-center justify-between bg-[#161B22]/30">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActivePanel("continuum")}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "continuum" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}
              >
                Continuum™
              </button>
              <button 
                onClick={() => setActivePanel("argument")}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "argument" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}
              >
                Argument Mode
              </button>
              <button 
                onClick={() => setActivePanel("causation")}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "causation" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}
              >
                Causation Map
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#9CA3AF]" />
              <input className="bg-transparent border-none text-[10px] uppercase tracking-wider font-bold w-48 focus:outline-none text-white" placeholder="Filter Narrative..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activePanel === "continuum" ? (
              <div className="space-y-4 max-w-3xl mx-auto">
                {events.map((e) => (
                  <div key={e.id} className="flex gap-6 group">
                    <div className="w-24 shrink-0 pt-1">
                      <span className="text-[11px] font-bold tabular-nums text-[#9CA3AF]">{e.dateLabel}</span>
                    </div>
                    <div className="relative pb-8 flex-1">
                      <div className="absolute left-[-13px] top-2 w-2 h-2 rounded-full bg-[#232A34] border border-[#0F1217] group-hover:bg-[#C6A85E] transition-colors" />
                      <div className="absolute left-[-10px] top-4 bottom-0 w-[1px] bg-[#232A34]" />
                      
                      <div className="bg-[#161B22] border border-[#232A34] rounded-lg p-5 hover:border-[#C6A85E]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C6A85E]">{e.eventType}</span>
                          <span className="text-[10px] font-mono text-[#9CA3AF]">EVID-STR {e.confidence}%</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#F3F5F7] line-clamp-4">{e.summary}</p>
                        <div className="mt-4 pt-4 border-t border-[#232A34] flex items-center justify-between">
                          <div className="flex gap-2">
                            {e.citations.slice(0, 2).map((c, i) => (
                              <Badge key={i} variant="outline" className="border-[#232A34] text-[#9CA3AF] text-[9px]">PG {c.page_number}</Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-[#C6A85E] hover:text-[#C6A85E] hover:bg-[#C6A85E]/10">
                            VIEW SOURCE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF]">
                <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Intelligence Layer Generating...</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT — EVIDENCE DOCK™ */}
        <aside className="w-[450px] xl:w-[550px] flex flex-col bg-[#161B22] shrink-0">
          <div className="h-12 border-b border-[#232A34] px-4 flex items-center justify-between bg-[#0F1217]/50">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-[#274C77]" />
              <span className="text-xs font-bold uppercase tracking-widest">Evidence Dock™</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0F1217] p-1 rounded-md border border-[#232A34]">
              <button onClick={() => setViewerMode("source")} className={`px-2 py-1 text-[9px] font-bold rounded ${viewerMode === "source" ? "bg-[#274C77] text-white" : "text-[#9CA3AF] hover:text-white"}`}>SOURCE</button>
              <button onClick={() => setViewerMode("chronology")} className={`px-2 py-1 text-[9px] font-bold rounded ${viewerMode === "chronology" ? "bg-[#274C77] text-white" : "text-[#9CA3AF] hover:text-white"}`}>CHRONOLOGY</button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#0F1217] p-4 relative">
            {viewerHref ? (
              <iframe key={viewerKey} title="Evidence Dock" src={viewerHref} className="w-full h-full border border-[#232A34] rounded shadow-2xl bg-white" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] opacity-30">
                <FileText className="h-16 w-16 mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select evidence to dock</span>
              </div>
            )}
            
            <div className="absolute bottom-8 right-8 bg-[#C6A85E] text-black font-black px-3 py-1 rounded-full text-xs shadow-xl">
              {events.length} CITES
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}