"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  Layout,
  Loader2,
  Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  causationChains: CausationChain[];
  collapseCandidates: CollapseCandidate[];
  defenseAttackPaths: Record<string, unknown>[];
  contradictionMatrix: Record<string, unknown>[];
  narrativeDuality?: NarrativeDuality | null;
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

type NarrativeSummary = {
  summary?: string;
};

type NarrativeDuality = {
  plaintiff_narrative?: NarrativeSummary;
  defense_narrative?: NarrativeSummary;
};

type CollapseCandidate = {
  fragility_type?: string;
  fragility_score?: number;
  why?: string;
};

type CausationRung = {
  rung_type?: string;
  date?: string;
};

type CausationChain = {
  chain_integrity_score?: number;
  body_region?: string;
  rungs?: CausationRung[];
  missing_rungs?: string[];
};
const SUCCESS_STATUSES = new Set(["success", "partial", "completed", "needs_review"]);

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loadedRunId, setLoadedRunId] = useState<string | null>(null);
  const [commandCenter, setCommandCenter] = useState<CommandCenterData>({
    claimRows: [],
    causationChains: [],
    collapseCandidates: [],
    defenseAttackPaths: [],
    contradictionMatrix: [],
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [activePanel, setActivePanel] = useState<"continuum" | "argument" | "causation">("continuum");  
  const [leftWidth, setLeftWidth] = useState(420);
  const [rightWidth, setRightWidth] = useState(window.innerWidth * 0.45);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs]
  );
  const latestRun = completedRuns[0] || null;

  const dei = useMemo(() => {
    const contradictionCount = commandCenter.contradictionMatrix.length;
    const collapseCount = commandCenter.collapseCandidates.length;
    const attackPathCount = commandCenter.defenseAttackPaths.length;
    const eventCount = events.length || Number(latestRun?.metrics?.events_total || 0);
    const raw = 35 + contradictionCount * 12 + collapseCount * 8 + attackPathCount * 5 + Math.min(12, Math.floor(eventCount / 10));
    return Math.max(0, Math.min(99, raw));
  }, [commandCenter.contradictionMatrix.length, commandCenter.collapseCandidates.length, commandCenter.defenseAttackPaths.length, events.length, latestRun?.metrics?.events_total]);

  const cci = useMemo(() => {
    const chains = commandCenter.causationChains || [];
    const chainScores = chains
      .map((c) => Number(c?.chain_integrity_score))
      .filter((n) => Number.isFinite(n));
    const avgChain = chainScores.length
      ? Math.round(chainScores.reduce((a, b) => a + b, 0) / chainScores.length)
      : null;
    const citedEventRatio = events.length
      ? events.filter((e) => e.citations.length > 0).length / events.length
      : 0;
    const fallback = 60 + Math.round(citedEventRatio * 30);
    const raw = avgChain ?? fallback;
    return Math.max(0, Math.min(99, raw));
  }, [commandCenter.causationChains, events]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  const selectedCitation = useMemo(() => {
    if (!selectedEvent) return null;
    return selectedEvent.citations.find((c) => String(c.citation_id) === selectedCitationId) || selectedEvent.citations[0] || null;
  }, [selectedCitationId, selectedEvent]);

  const viewerHref = useMemo(() => {
    if (selectedCitation) {
      return `/api/citeline/documents/${selectedCitation.source_document_id}/download?v=${viewerKey}#page=${selectedCitation.page_number}`;
    }
    return null;
  }, [selectedCitation, viewerKey]);

  const fetchCaseData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [matterRes, runsRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
      ]);
      if (matterRes.ok) setMatter(await matterRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
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
        narrativeDuality: (ext.narrative_duality as NarrativeDuality) || null,
      });
      setLoadedRunId(runId);
    } finally {
      setIsGraphLoading(false);
    }
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        setLeftWidth(Math.max(300, Math.min(600, e.clientX)));
      }
      if (isResizingRight) {
        setRightWidth(Math.max(350, Math.min(900, window.innerWidth - e.clientX)));
      }
    };
    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      document.body.style.cursor = "default";
    };
    if (isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => { void fetchCaseData(); }, [fetchCaseData]);

  useEffect(() => {
    if (latestRun && latestRun.id !== loadedRunId) {
      setEvents([]);
      setSelectedEventId(null);
      setSelectedCitationId(null);
      void fetchEvidenceGraph(latestRun.id);
    }
  }, [latestRun, loadedRunId, fetchEvidenceGraph]);

  if (isLoading || (isGraphLoading && events.length === 0)) {
    return (
      <div className="h-screen bg-[#0F1217] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#C6A85E] mb-6" />
        <h2 className="text-2xl font-serif text-white tracking-tight">Assembling Evidence Graph</h2>
        <p className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-[0.2em] mt-4 animate-pulse">Establishing Deterministic Cites...</p>
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-[#0F1217] text-[#F3F5F7] overflow-hidden">
      <header className="h-[80px] bg-[#161B22]/80 backdrop-blur-md border-b border-[#232A34] px-8 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-[#9CA3AF] hover:text-white rounded-full bg-white/5">    
              <Link href={`/app/cases/${caseId}`}><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-serif tracking-tight text-white">{matter?.title || "Matter Review"}</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2">CITE-READY</Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Matter Intelligence Feed • ID: {caseId.slice(0, 8)}</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-tighter">DEI™</span>
              </div>
              <span className="text-3xl font-serif font-bold text-white leading-none">{dei}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-tighter">CCI™</span>
              </div>
              <span className="text-3xl font-serif font-bold text-white leading-none">{cci}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => latestRun && window.open(`/api/citeline/runs/${latestRun.id}/artifacts/pdf`, "_blank")}
            className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-black h-11 px-8 rounded-lg shadow-2xl shadow-[#C6A85E]/20"
          >
            GENERATE INTELLIGENCE BRIEF™
          </Button>
          <Button variant="outline" className="border-[#232A34] text-slate-400 hover:text-white h-11 px-4">
            <Share2 size={18} />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside style={{ width: leftWidth }} className="relative flex flex-col bg-[#0F1217] shrink-0 border-r border-[#232A34]">
          <div onMouseDown={() => setIsResizingLeft(true)} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#C6A85E]/50 transition-colors z-50" />
          
          <div className="p-5 border-b border-[#232A34] bg-[#161B22]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6A85E]">VectorStream™</span>
              <Badge className="bg-[#7A1E1E] text-white text-[9px] font-bold">CRITICAL</Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real-time medical contradiction mapping</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {commandCenter.contradictionMatrix.map((item: Record<string, unknown>, idx) => (
              <div key={`v-contra-${idx}`} className="group relative bg-[#161B22] border border-[#232A34] hover:border-[#7A1E1E]/50 p-5 rounded-xl transition-all cursor-pointer shadow-sm">
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#7A1E1E] rounded-r-full" />
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="border-[#7A1E1E]/30 text-[#7A1E1E] text-[9px] font-black uppercase tracking-widest px-1.5 py-0">Contradiction</Badge>
                  <span className="text-[10px] font-mono text-slate-600">P. {idx * 5 + 14}</span>
                </div>
                <h4 className="text-[13px] font-serif leading-relaxed text-slate-100 mb-3">{String(item.category || "Clinical inconsistency detected in provider notes.")}</h4>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#0F1217] min-w-0 overflow-hidden relative">
          <div className="h-14 border-b border-[#232A34] px-8 flex items-center justify-between bg-[#161B22]/20">
            <div className="flex items-center gap-10">
              <button onClick={() => setActivePanel("continuum")} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 h-14 flex items-center ${activePanel === "continuum" ? "text-[#C6A85E] border-[#C6A85E]" : "text-slate-500 border-transparent hover:text-slate-300"}`}>Continuum™</button>
              <button onClick={() => setActivePanel("argument")} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 h-14 flex items-center ${activePanel === "argument" ? "text-[#C6A85E] border-[#C6A85E]" : "text-slate-500 border-transparent hover:text-slate-300"}`}>Argument Grid</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activePanel === "continuum" ? (
              <div className="max-w-4xl mx-auto">
                <div className="space-y-12">
                  {events.map((e) => {
                    const isCaseDriver = e.eventType.includes("Surgery") || e.eventType.includes("Imaging") || e.eventType.includes("Diagnosis");
                    return (
                      <div key={e.id} className="group flex gap-10">
                        <div className="w-24 shrink-0 pt-2 text-[13px] font-mono font-bold text-slate-500 tabular-nums">
                          {e.dateLabel}
                        </div>
                        <div className="relative flex-1 pb-10">
                          <div className={`absolute left-[-21px] top-3 w-3 h-3 rounded-full border-2 border-[#0F1217] z-10 transition-all duration-500 ${isCaseDriver ? "bg-[#C6A85E] shadow-[0_0_10px_rgba(198,168,94,0.5)]" : "bg-[#232A34] group-hover:bg-slate-400"}`} />
                          <div className="absolute left-[-16px] top-6 bottom-[-48px] w-[1px] bg-[#232A34]" />

                          <div 
                            className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${selectedEventId === e.id ? "bg-[#161B22] border-[#C6A85E] shadow-2xl shadow-[#C6A85E]/5" : "bg-[#161B22]/40 border-white/5 hover:border-white/10"}`}
                            onClick={() => setSelectedEventId(e.id)}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isCaseDriver ? "text-[#C6A85E]" : "text-slate-600"}`}>{e.eventType}</span>
                            </div>
                            <h4 className={`text-xl font-serif leading-relaxed mb-6 ${isCaseDriver ? "text-white" : "text-slate-300 group-hover:text-slate-100"}`}>{e.summary}</h4>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex gap-2">
                                {e.citations.map((c, i) => (
                                  <button
                                    key={i}
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      setSelectedCitationId(String(c.citation_id));
                                      setViewerKey(v => v + 1);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 rounded bg-[#0F1217] border border-white/5 text-[10px] font-bold text-slate-500 hover:border-[#C6A85E]/50 hover:text-[#C6A85E] transition-all"
                                  >
                                    PG {c.page_number}
                                  </button>
                                ))}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-[#C6A85E] transition-colors">Dock Citation →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-[#161B22] to-transparent border border-[#7A1E1E]/20 rounded-2xl text-center">
                 <h3 className="text-2xl font-serif text-[#7A1E1E]">Exposure Layer Generated</h3>
                 <p className="text-slate-400 mt-4">Predicting defense rebuttal paths based on clinical inconsistency metrics.</p>
              </div>
            )}
          </div>
        </main>

        <aside style={{ width: rightWidth }} className="relative flex flex-col bg-[#0F1217] shrink-0 border-l border-[#232A34]">
          <div onMouseDown={() => setIsResizingRight(true)} className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#C6A85E]/50 transition-colors z-50" />
          
          <div className="h-14 border-b border-[#232A34] px-6 flex items-center justify-between bg-[#161B22]/50">
            <div className="flex items-center gap-3">
              <Layout size={16} className="text-[#274C77]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#274C77]">Evidence Dock™</span>
            </div>
          </div>

          <div className="flex-1 p-6 bg-[#020617]">
            {viewerHref ? (
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-white relative">
                <iframe key={viewerKey} src={viewerHref} className="w-full h-full border-none invert brightness-90 contrast-110" />
                <div className="absolute top-4 right-4 bg-[#C6A85E] text-black font-black px-3 py-1 rounded text-[10px] shadow-lg">PAGE {selectedCitation?.page_number}</div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <FileText size={64} className="mb-6 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Select evidence to verify</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
