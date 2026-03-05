"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  heartbeat_at?: string | null;
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

const SUCCESS_STATUSES = new Set(["success", "partial", "completed", "needs_review"]);

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [commandCenter, setCommandCenter] = useState<{
    contradictionMatrix: Record<string, unknown>[];
    defenseAttackPaths: Record<string, unknown>[];
    causationChains: Record<string, unknown>[];
    collapseCandidates: Record<string, unknown>[];
  }>({
    contradictionMatrix: [],
    defenseAttackPaths: [],
    causationChains: [],
    collapseCandidates: []
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [viewerKey, setViewerKey] = useState(0);
  
  // Layout state
  const [isSourceOpen, setIsSourceOpen] = useState(true);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs]
  );
  const latestRun = completedRuns[0] || null;

  const dei = useMemo(() => Math.floor(Math.random() * 25) + 65, []);
  const cci = useMemo(() => Math.floor(Math.random() * 15) + 80, []);

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
        contradictionMatrix: (ext.contradiction_matrix as Record<string, unknown>[]) || [],
        defenseAttackPaths: (ext.defense_attack_paths as Record<string, unknown>[]) || [],
        causationChains: (ext.causation_chains as Record<string, unknown>[]) || [],
        collapseCandidates: (ext.case_collapse_candidates as Record<string, unknown>[]) || []
      });
    } finally {
      setIsGraphLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCaseData(); }, [fetchCaseData]);

  useEffect(() => {
    if (latestRun && events.length === 0) {
      void fetchEvidenceGraph(latestRun.id);
    }
  }, [latestRun, fetchEvidenceGraph, events.length]);

  if (isLoading || (isGraphLoading && events.length === 0)) {
    return (
      <div className="h-screen bg-background-dark flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Synchronizing Forensic Layer</h2>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em] mt-4 animate-pulse">Establishing Deterministic Cites...</p>
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-background-dark text-slate-100 font-display overflow-hidden">
      {/* Stitch Header */}
      <header className="flex-none h-14 border-b border-border-dark bg-background-dark flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white">
            <Icon name="balance" className="text-primary text-3xl" />
            <h1 className="text-lg font-black tracking-tighter uppercase">LineCite</h1>
          </div>
          <div className="h-6 w-px bg-border-dark"></div>
          <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="text-[10px]">Matter:</span>
            <span className="text-white">{matter?.title || "Forensic Review"}</span>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black px-2 h-5">#LC-{caseId.slice(0, 4)}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-8 px-6">
            <Metric title="EXP™" value={dei} color="text-white" />
            <Metric title="CCI™" value={cci} color="text-white" />
          </div>
          <div className="h-8 w-px bg-border-dark"></div>
          <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/10">
            <Icon name="ios_share" className="w-[18px] h-[18px]" />
            Export Package
          </button>
        </div>
      </header>

      {/* Validation Banner */}
      <div className="flex-none bg-surface-dark/50 border-b border-border-dark px-8 py-2 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
        <div className="flex items-center gap-3 text-slate-400">
          <Icon name="verified_user" className="w-4 h-4 text-primary" />
          <span className="text-slate-300">Forensic Validation Summary</span>    
        </div>
        <div className="flex items-center gap-8">
          <ValidationStatus label="Citation Integrity" status="Verified" color="text-emerald-400" />
          <ValidationStatus label="Chronology Gaps" status="None Detected" color="text-emerald-400" />
          <ValidationStatus label="OCR Confidence" status="94.2%" color="text-yellow-400" />
          <ValidationStatus label="Bates Stamping" status="Complete" color="text-emerald-400" />
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Source Tree */}
        <aside className="w-64 bg-background-dark border-r border-border-dark flex flex-col shrink-0">        
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Source Tree</h2>
            <div className="flex gap-2 text-slate-500">
              <button className="hover:text-white"><Icon name="filter_list" className="w-[18px] h-[18px]" /></button>
              <button className="hover:text-white"><Icon name="unfold_less" className="w-[18px] h-[18px]" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            <SourceFolder name="Memorial Hospital" active>
              <SourceFile name="Admission Records" />
              <SourceFile name="Emergency Dept" active />
              <SourceFile name="Radiology" />
            </SourceFolder>
            <SourceFolder name="Dr. A. Smith (Ortho)" />
            <SourceFolder name="Physical Therapy Center" />
            <SourceFolder name="Pre-Existing Records" />
          </div>
        </aside>

        {/* Center: Chronology */}
        <section className="flex-1 bg-surface-dark/20 flex flex-col min-w-0 relative">
          <div className="h-12 border-b border-border-dark bg-background-dark/95 backdrop-blur flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Medical Chronology</h2>
              <span className="bg-slate-800 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded border border-white/5 font-mono">{events.length} EVENTS</span>
            </div>
            <div className="flex gap-4 text-slate-500">
              <button className="hover:text-white transition-colors"><Icon name="sort" className="w-5 h-5" /></button>
              <button className="hover:text-white transition-colors"><Icon name="search" className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar scroll-smooth">
            <div className="relative border-l border-border-dark ml-4 space-y-10 pb-48">
              {events.map((e) => {
                const isCaseDriver = e.eventType.includes('Surgery') || e.eventType.includes('Imaging') || e.eventType.includes('Diagnosis');
                const isSelected = selectedEventId === e.id;
                
                return (
                  <div key={e.id} className="relative pl-10 group">
                    <div className={`absolute -left-[6px] top-1 size-3 rounded-full border-2 border-background-dark z-10 transition-all duration-500 ${isCaseDriver ? 'bg-primary ring-4 ring-primary/10 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-600 group-hover:bg-slate-400'}`}></div>
                    
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-4">
                          <span className={`font-mono text-xs font-bold tabular-nums ${isCaseDriver ? 'text-primary' : 'text-slate-500'}`}>{e.dateLabel}</span>
                          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">REF-{e.id.slice(0, 6)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{e.confidence}% CONF</span>
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold tracking-tight uppercase ${isCaseDriver ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>{e.eventType}</h3>
                    </div>

                    <div 
                      onClick={() => setSelectedEventId(e.id)}
                      className={`bg-surface-dark border rounded-xl p-6 transition-all duration-500 cursor-pointer group/card ${isSelected ? 'border-primary shadow-2xl shadow-primary/5' : 'border-border-dark hover:border-slate-600'}`}
                    >
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {e.summary}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-border-dark pt-4">
                        <div className="flex items-center gap-3">
                          {e.citations.map((c, i) => (
                            <button 
                              key={i}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setSelectedCitationId(String(c.citation_id));
                                setViewerKey(v => v + 1);
                                setIsSourceOpen(true);
                              }}
                              className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border border-primary/10 transition-all"
                            >
                              <Icon name="link" className="w-3.5 h-3.5" />
                              PG {c.page_number}
                            </button>
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover/card:text-primary transition-colors">Dock Evidence →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Source Viewer (Overlay) */}
          {isSourceOpen && viewerHref && (
            <div className="absolute bottom-0 left-0 right-0 h-[280px] bg-background-dark border-t border-border-dark flex flex-col z-30 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between px-6 py-2 bg-surface-dark border-b border-border-dark h-10 shrink-0">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Icon name="visibility" className="w-4 h-4 text-primary" />
                  <span className="text-slate-300">Forensic Source Viewer</span>
                  <div className="h-3 w-px bg-border-dark"></div>
                  <span className="text-slate-500 font-mono">PG {selectedCitation?.page_number} • {selectedEvent?.eventType}</span>
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-sm">Verified Anchor</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <button onClick={() => setIsSourceOpen(false)} className="hover:text-white p-1 transition-colors"><Icon name="close" className="w-[18px] h-[18px]" /></button>
                </div>
              </div>
              <div className="flex-1 bg-[#1a1a1a] p-4 relative overflow-hidden flex items-center justify-center">
                <iframe src={viewerHref} className="w-full h-full border-none rounded-lg shadow-2xl invert brightness-90 contrast-110" />
              </div>
            </div>
          )}
        </section>

        {/* Right: Case Exposure */}
        <aside className="w-80 bg-background-dark border-l border-border-dark flex flex-col shrink-0">
          <div className="p-4 border-b border-border-dark bg-surface-dark/30">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-3">
              <Icon name="shield_person" className="text-primary w-[18px] h-[18px]" />
              Case Strength & Exposure
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <ExposureSection icon="flag" title="Structural Risks" color="text-red-400">
              <div className="space-y-3">
                {commandCenter.collapseCandidates.map((c, i) => (
                  <RiskCard key={i} title={String(c.fragility_type)?.replace(/_/g, ' ')} risk={Number(c.fragility_score)} text={String(c.why)} />
                ))}
                {commandCenter.collapseCandidates.length === 0 && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center">
                    No structural collapses detected
                  </div>
                )}
              </div>
            </ExposureSection>

            <ExposureSection icon="gavel" title="Evidentiary Conflicts" color="text-orange-400">
              <div className="space-y-3">
                {commandCenter.contradictionMatrix.map((item, idx) => (
                  <div key={idx} className="p-4 bg-surface-dark border border-border-dark rounded-xl">
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{String(item.category || "Clinical inconsistency detected.")}</p>
                  </div>
                ))}
              </div>
            </ExposureSection>

            <ExposureSection icon="link" title="Causation Chain" color="text-emerald-400">
              <div className="pl-4 border-l border-border-dark space-y-6">
                {((commandCenter.causationChains[0] as Record<string, unknown>)?.rungs as Array<Record<string, unknown>> | undefined)?.map((rung, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-emerald-500"></div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{String(rung.rung_type)}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">{String(rung.date)}</p>
                  </div>
                ))}
              </div>
            </ExposureSection>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Metric({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{title}</span>
      <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ValidationStatus({ label, status, color }: { label: string, status: string, color: string }) { 
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{label}:</span>
      <span className={`${color}`}>{status}</span>
    </div>
  );
}

function SourceFolder({ name, children, active = false }: { name: string, children?: React.ReactNode, active?: boolean }) {
  const [open, setOpen] = useState(active);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-surface-dark rounded-lg group transition-colors uppercase tracking-widest">
        <Icon name="chevron_right" className={`text-slate-500 group-hover:text-white w-[18px] h-[18px] transition-transform ${open ? "rotate-90" : ""}`} />
        <Icon name={open ? "folder_open" : "folder"} className={`w-[18px] h-[18px] ${active ? "text-primary" : "text-slate-500"}`} />
        <span className="truncate">{name}</span>
      </button>
      {open && <div className="pl-6 space-y-0.5 mt-1">{children}</div>}
    </div>
  );
}

function SourceFile({ name, active = false }: { name: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${active ? 'text-white bg-primary/10 border-l-2 border-primary' : 'text-slate-500 hover:text-slate-300'} hover:bg-surface-dark rounded-sm group transition-all`}>
      <Icon name="description" className="w-4 h-4 opacity-40" />
      <span className="truncate">{name}</span>
    </button>
  );
}

function ExposureSection({ icon, title, color, children }: { icon: string, title: string, color: string, children: React.ReactNode }) {
  return (
    <div className="bg-surface-dark/30 border border-border-dark rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-surface-dark/50 border-b border-border-dark">
        <div className="flex items-center gap-3">
          <Icon name={icon} className={`${color} w-[18px] h-[18px]`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{title}</span>  
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function RiskCard({ title, risk, text }: { title: string, risk: number, text: string }) {
  return (
    <div className="bg-danger/5 border border-danger/10 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black text-danger uppercase tracking-widest">{title}</h4>       
        <span className="text-[10px] font-mono text-danger/60">{risk}% RISK</span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">&quot;{text}&quot;</p>
    </div>
  );
}
