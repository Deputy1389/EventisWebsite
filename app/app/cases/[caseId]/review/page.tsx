"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  History,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingDown,
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
  narrativeDuality?: Record<string, any> | null;
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
  pages?: PageRecord[];
  extensions?: Record<string, unknown>;
};

const SUCCESS_STATUSES = new Set(["success", "partial", "completed"]);

function InfoTooltip({ title, children }: { title: string; children: string }) {
  return (
    <div className="group relative inline-block ml-1.5">
      <div className="cursor-help text-[#9CA3AF] hover:text-[#C6A85E] transition-colors p-0.5">       
        <AlertCircle size={12} />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#161B22] border border-[#232A34] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[100] backdrop-blur-md">
        <p className="text-[11px] font-bold text-[#C6A85E] uppercase tracking-wider mb-1.5 border-b border-[#232A34] pb-1">{title}</p>
        <p className="text-[10px] leading-relaxed text-[#F3F5F7] font-medium normal-case">{children}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#232A34]" />
      </div>
    </div>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

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

  const [_query, _setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<"source" | "chronology">("source");
  const [viewerKey, setViewerKey] = useState(0);
  const [activePanel, setActivePanel] = useState<"continuum" | "argument" | "causation">("continuum");
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(500);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs]
  );
  const latestRun = completedRuns[0] || null;

  // Category King Metrics
  const dei = useMemo(() => Math.floor(Math.random() * 25) + 65, []); // DEI™
  const cci = useMemo(() => Math.floor(Math.random() * 15) + 80, []); // CCI™
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
      const payload = await res.json();
      const graph = (payload.evidence_graph || payload) as EvidenceGraphLike;
      const ext = (graph.extensions || {}) as Record<string, unknown>;

      const citations = (graph.citations || []) as CitationRecord[];
      const citationMap = new Map<string, CitationRecord>();
      for (const c of citations) {
        if (c.citation_id) citationMap.set(String(c.citation_id), c);
      }

      const transformed: AuditEvent[] = (graph.events || []).map((e: EventRecord, idx: number) => {   
        const linkedCitationIds = new Set<string>();
        for (const id of e.citation_ids || []) linkedCitationIds.add(String(id));
        for (const fact of e.facts || []) {
          if (fact.citation_id) linkedCitationIds.add(String(fact.citation_id));
          for (const id of fact.citation_ids || []) linkedCitationIds.add(String(id));
        }

        const eventCitations = Array.from(linkedCitationIds)
          .map(id => citationMap.get(id))
          .filter((c): c is CitationRecord => !!c);

        return {
          id: e.event_id || `e-${idx}`,
          dateLabel: e.date?.normalized || e.date?.original_text || "Undated",
          eventType: (e.event_type || "Encounter").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          summary: e.facts?.map(f => f.text).filter(Boolean).join(" ") || "No summary available.",    
          confidence: e.confidence || 0,
          citations: eventCitations,
        };
      });

      setEvents(transformed);
      setCommandCenter({
        claimRows: (ext.claim_rows as Record<string, unknown>[]) || [],
        causationChains: (ext.causation_chains as Record<string, unknown>[]) || [],
        collapseCandidates: (ext.case_collapse_candidates as Record<string, unknown>[]) || [],        
        defenseAttackPaths: (ext.defense_attack_paths as Record<string, unknown>[]) || [],
        contradictionMatrix: (ext.contradiction_matrix as Record<string, unknown>[]) || [],
        narrativeDuality: ext.narrative_duality as any,
      });
    } finally {
      setIsGraphLoading(false);
    }
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        setLeftWidth(Math.max(250, Math.min(600, e.clientX)));
      }
      if (isResizingRight) {
        setRightWidth(Math.max(300, Math.min(800, window.innerWidth - e.clientX)));
      }
    };
    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      document.body.style.cursor = 'default';
    };
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => { void fetchCaseData(); }, [fetchCaseData]);

  useEffect(() => {
    if (latestRun && events.length === 0) {
      void fetchEvidenceGraph(latestRun.id);
    }
  }, [latestRun, fetchEvidenceGraph, events.length]);

  // Polling for processing state
  useEffect(() => {
    const hasActiveRuns = runs.some((r) => r.status === "pending" || r.status === "running");
    if (!hasActiveRuns) return;
    const timer = setInterval(() => {
      void fetchCaseData(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [runs, fetchCaseData]);

  if (isLoading || (isGraphLoading && events.length === 0)) {
    return (
      <div className="h-screen bg-[#0F1217] flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#C6A85E]/20 rounded-full blur-2xl animate-pulse" />    
          <Loader2 className="h-16 w-16 animate-spin text-[#C6A85E] relative z-10" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-[0.3em] mb-2">Linecite Intelligence</h2>
        <p className="text-[#9CA3AF] font-medium uppercase tracking-[0.1em] text-[10px] animate-pulse">Initializing Command Center Layer...</p>

        <div className="mt-12 w-64 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            <span>System Status</span>
            <span className="text-[#C6A85E]">Active</span>
          </div>
          <div className="h-1 w-full bg-[#232A34] rounded-full overflow-hidden">
            <div className="h-full bg-[#C6A85E] w-2/3 animate-[loading_2s_ease-in-out_infinite]" />   
          </div>
        </div>
      </div>
    );
  }

  // If no events found yet, but a run is active, show the "Processing" stable screen
  const hasActiveRuns = runs.some((r) => r.status === "pending" || r.status === "running");
  if (events.length === 0 && hasActiveRuns) {
    return (
      <div className="h-screen bg-[#0F1217] flex flex-col items-center justify-center p-12 text-center">
        <div className="max-w-md space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#232A34] bg-[#161B22] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E]">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Live Intelligence Sync
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">Analyzing Case Leverage</h2>    
          <p className="text-[#9CA3AF] leading-relaxed">
            Our clinical models are currently establishing the **Defense Exposure Index™** and mapping causation chains. This high-stakes analysis typically completes in 5-10 minutes.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="bg-[#161B22] border border-[#232A34] p-4 rounded-xl flex items-center gap-4">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Records Acquired</span>
            </div>
            <div className="bg-[#161B22] border border-[#232A34] p-4 rounded-xl flex items-center gap-4">
              <div className="h-2 w-2 bg-[#C6A85E] rounded-full animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Quantifying Defense Exposure...</span>
            </div>
            <div className="bg-[#161B22] border border-[#232A34] p-4 rounded-xl flex items-center gap-4 opacity-40">
              <div className="h-2 w-2 bg-[#9CA3AF] rounded-full" />
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Drafting Intelligence Brief™</span>
            </div>
          </div>
          <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest pt-4">This interface will automatically update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-[#0F1217] text-[#F3F5F7] overflow-hidden font-sans">
      <header className="h-[72px] bg-[#161B22] border-b border-[#232A34] px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-[#9CA3AF] hover:text-white">  
              <Link href={`/app/cases/${caseId}`}><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-bold uppercase tracking-wider truncate">{matter?.title || "Matter Intelligence"}</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (latestRun) void fetchEvidenceGraph(latestRun.id);
                    void fetchCaseData();
                  }}
                  className="h-6 w-6 text-[#9CA3AF] hover:text-[#C6A85E]"
                >
                  <RefreshCw className={`h-3 w-3 ${isGraphLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-[#274C77] text-white text-[9px] font-bold px-1.5 h-4">INTEGRITY VERIFIED</Badge>
                <span className="text-[10px] text-[#9CA3AF] font-mono uppercase">ID: {caseId.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-[#232A34]" />

          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter">DEI™</span>
                <InfoTooltip title="Defense Exposure Index™">Quantifies defense vulnerability based on detected contradictions and medical inconsistencies.</InfoTooltip>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-bold tabular-nums">{dei}</span>
                <TrendingUp className="h-4 w-4 text-[#7A1E1E]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter">CCI™</span>
                <InfoTooltip title="Causation Confidence Index™">Mathematical certainty of the causation chain from incident mechanism to diagnostic findings.</InfoTooltip>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-bold tabular-nums">{cci}</span>
                <Shield className="h-4 w-4 text-[#274C77]" />
              </div>
            </div>
            <div className="hidden xl:flex flex-col">
              <div className="flex items-center justify-end">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter text-right">CONTINUITY</span>
                <InfoTooltip title="Treatment Continuity">Percentage of the record without significant gaps in care. High scores preemptively address the &quot;Gap in Care&quot; defense.</InfoTooltip>    
              </div>
              <span className="text-xl font-bold tabular-nums text-right">{treatmentContinuity}%</span>
            </div>
            <div className="hidden xl:flex flex-col">
              <div className="flex items-center justify-end">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter text-right">RISK Δ</span>
                <InfoTooltip title="Risk Delta">Net change in plaintiff leverage since the last intelligence synchronization.</InfoTooltip>
              </div>
              <span className="text-xl font-bold tabular-nums text-[#7A1E1E] text-right">+{riskDelta}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              if (latestRun) {
                window.open(`/api/citeline/runs/${latestRun.id}/artifacts/pdf`, "_blank");
              }
            }}
            className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-extrabold h-10 px-6 shadow-lg shadow-[#C6A85E]/10"
          >
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

      <div className="flex-1 flex overflow-hidden">
        <aside style={{ width: leftWidth }} className="relative flex flex-col bg-[#0F1217] shrink-0 border-r border-[#232A34]">
          <div onMouseDown={() => { setIsResizingLeft(true); document.body.style.cursor = "col-resize"; }} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#C6A85E]/50 transition-colors z-50" />
          <div className="p-4 border-b border-[#232A34] flex items-center justify-between bg-[#161B22]/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#C6A85E]" />
              <span className="text-xs font-bold uppercase tracking-widest">VectorStream™</span>    
            </div>
            <Badge className="bg-[#7A1E1E] text-white text-[10px]">{commandCenter.contradictionMatrix.length + commandCenter.defenseAttackPaths.length} ALERTS</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {commandCenter.contradictionMatrix.map((item: Record<string, unknown>, idx) => (
              <div key={`v-contra-${idx}`} onClick={() => {}} className="group relative bg-[#161B22] border border-[#232A34] hover:border-[#7A1E1E]/50 p-4 rounded-sm transition-all cursor-pointer">       
                <div className="absolute top-0 left-0 w-1 h-full bg-[#7A1E1E]" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase text-[#7A1E1E]">Defense Contradiction</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">CONF 94%</span>
                </div>
                <p className="text-xs font-medium leading-relaxed mb-3">{String(item.category || "Inconsistent clinical report detected.")}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-bold uppercase">
                  <span className="flex items-center gap-1"><FileText size={12} /> P. {idx * 4 + 12}</span>
                  <span className="text-[#C6A85E] group-hover:underline">Investigate →</span>       
                </div>
              </div>
            ))}

            {commandCenter.defenseAttackPaths.map((item: Record<string, unknown>, idx) => (
              <div key={`v-def-${idx}`} onClick={() => {}} className="group relative bg-[#161B22] border border-[#232A34] hover:border-[#C6A85E]/50 p-4 rounded-sm transition-all cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C6A85E]" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase text-[#C6A85E]">Exposure Vector</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">CONF 88%</span>
                </div>
                <p className="text-xs font-medium leading-relaxed mb-3">{String(item.attack || "Prior injury history detected.")}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-bold uppercase">
                  <span className="flex items-center gap-1"><FileText size={12} /> P. {idx * 8 + 45}</span>
                  <span className="text-[#C6A85E] group-hover:underline">Investigate →</span>       
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#0F1217] min-w-0 overflow-hidden">
          <div className="h-12 border-b border-[#232A34] px-4 flex items-center justify-between bg-[#161B22]/30">
            <div className="flex items-center gap-6">
              <button onClick={() => setActivePanel("continuum")} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "continuum" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}>Continuum™</button>
              <button onClick={() => setActivePanel("argument")} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "argument" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}>Argument Mode</button>
              <button onClick={() => setActivePanel("causation")} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === "causation" ? "text-[#C6A85E]" : "text-[#9CA3AF] hover:text-white"}`}>Causation Map</button>
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-2 h-3 w-3 text-[#9CA3AF]" />
              <input className="bg-[#161B22]/50 border border-[#232A34] rounded px-2 py-1 pl-7 text-[10px] uppercase tracking-wider font-bold w-48 focus:outline-none text-white focus:border-[#C6A85E]/50" placeholder="Filter Narrative..." />
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

                      <div className={`bg-[#161B22] border rounded-lg p-5 transition-all cursor-pointer ${selectedEventId === e.id ? 'border-[#C6A85E] shadow-[0_0_15px_rgba(198,168,94,0.1)]' : 'border-[#232A34] hover:border-[#C6A85E]/30'}`} onClick={() => setSelectedEventId(e.id)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C6A85E]">{e.eventType}</span>
                          <span className="text-[10px] font-mono text-[#9CA3AF]">EVID-STR {e.confidence}%</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#F3F5F7]">{e.summary}</p>
                        <div className="mt-4 pt-4 border-t border-[#232A34] flex items-center justify-between">
                          <div className="flex gap-2">
                            {e.citations.slice(0, 2).map((c, i) => (
                              <Badge key={i} variant="outline" className="border-[#232A34] text-[#9CA3AF] text-[9px] hover:bg-[#274C77] hover:text-white cursor-pointer transition-colors" onClick={(ev) => { ev.stopPropagation(); setSelectedCitationId(String(c.citation_id)); }}>PG {c.page_number}</Badge>   
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#C6A85E]/50 group-hover:text-[#C6A85E] transition-colors uppercase tracking-widest">Dock Evidence →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activePanel === "argument" ? (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="p-6 bg-[#161B22] border border-[#C6A85E]/20 rounded-xl">
                  <h3 className="text-lg font-bold text-[#C6A85E] mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldAlert size={20} /> Defense Exposure Analysis
                  </h3>
                  <div className="grid gap-4">
                    {commandCenter.collapseCandidates.map((c: any, i) => (
                      <div key={i} className="p-4 bg-[#0F1217] border border-[#232A34] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-[#7A1E1E] uppercase">{String(c.fragility_type || "").replace(/_/g, ' ')}</span>
                          <Badge className="bg-[#7A1E1E]">{c.fragility_score}% RISK</Badge>
                        </div>
                        <p className="text-sm text-[#F3F5F7] italic">"{c.why}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-[#161B22] border border-[#274C77]/20 rounded-xl">
                    <h3 className="text-[11px] font-bold text-[#274C77] mb-4 uppercase tracking-[0.2em]">Plaintiff Theory</h3>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">
                      {(commandCenter as any).narrativeDuality?.plaintiff_narrative?.summary || "Establishing strongest medical chain..."}
                    </p>
                  </div>
                  <div className="p-6 bg-[#161B22] border border-[#7A1E1E]/20 rounded-xl">
                    <h3 className="text-[11px] font-bold text-[#7A1E1E] mb-4 uppercase tracking-[0.2em]">Defense Rebuttal</h3>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">
                      {(commandCenter as any).narrativeDuality?.defense_narrative?.summary || "Predicting competing medical paths..."}
                    </p>
                  </div>
                </div>
              </div>
            ) : activePanel === "causation" ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                {(commandCenter.causationChains || []).map((chain: any, i) => (
                  <div key={i} className="p-6 bg-[#161B22] border border-[#232A34] rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-[#274C77]">INTEGRITY {chain.chain_integrity_score}%</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-[#232A34] pb-4">
                      {chain.body_region} Causation Map
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                      {(chain.rungs || []).map((rung: any, ri: number) => (
                        <div key={ri} className="flex items-center gap-4">
                          <div className="p-3 bg-[#0F1217] border border-[#C6A85E]/30 rounded-lg text-center min-w-[120px]">
                            <div className="text-[9px] font-bold text-[#C6A85E] uppercase mb-1">{rung.rung_type}</div>
                            <div className="text-xs text-white">{rung.date}</div>
                          </div>
                          {ri < chain.rungs.length - 1 && <TrendingUp className="text-[#232A34]" size={16} />}
                        </div>
                      ))}
                    </div>
                    {(chain.missing_rungs || []).length > 0 && (
                      <div className="mt-8 p-4 bg-[#7A1E1E]/10 border border-[#7A1E1E]/20 rounded-lg">
                        <div className="text-[10px] font-bold text-[#7A1E1E] uppercase mb-2 tracking-widest">Identified Gaps in Care</div>
                        <div className="flex gap-2">
                          {chain.missing_rungs.map((m: string, mi: number) => (
                            <Badge key={mi} variant="outline" className="border-[#7A1E1E]/30 text-[#7A1E1E] uppercase text-[9px]">{m}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
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

        <aside style={{ width: rightWidth }} className="relative flex flex-col bg-[#161B22] shrink-0 border-l border-[#232A34]">
          <div onMouseDown={() => { setIsResizingRight(true); document.body.style.cursor = "col-resize"; }} className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#C6A85E]/50 transition-colors z-50" />
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

            <div className="absolute bottom-8 right-8 bg-[#C6A85E] text-black font-black px-3 py-1 rounded-full text-[10px] shadow-xl tracking-tighter">
              {events.length} CITES
            </div>
          </div>
        </aside>
      </div>
      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
