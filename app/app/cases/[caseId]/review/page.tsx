"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  FileText,
  GitBranch,
  Loader2,
  Scale,
  Search,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  metrics?: {
    events_total?: number;
    providers_detected?: number;
    pages_total?: number;
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
  facts?: Array<{ text?: string }>;
  source_page_numbers?: number[];
  citation_ids?: string[];
};

type CommandCenterData = {
  claimRows: Record<string, unknown>[];
  causationChains: Record<string, unknown>[];
  collapseCandidates: Record<string, unknown>[];
  contradictionMatrix: Record<string, unknown>[];
  narrativeDuality: Record<string, unknown> | null;
  citationFidelity: Record<string, unknown> | null;
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
  events?: EventRecord[];
  citations?: CitationRecord[];
  pages?: PageRecord[];
  extensions?: Record<string, unknown>;
};

const SUCCESS_STATUSES = new Set(["success", "partial", "completed"]);

function normalizeEventType(raw: string | undefined): string {
  return (raw || "Encounter")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickSummary(e: EventRecord): string {
  const fact = (e.facts || []).map((f) => (f?.text || "").trim()).find(Boolean);
  if (!fact) return "No extracted summary for this event.";
  return fact.length > 280 ? `${fact.slice(0, 277)}...` : fact;
}

function parseDateLabel(e: EventRecord): string {
  const normalized = e.date?.normalized?.trim();
  const original = e.date?.original_text?.trim();
  return normalized || original || "Undated";
}

function extractGraphPayload(payload: unknown): EvidenceGraphLike | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;

  if (Array.isArray(p.events)) return p as EvidenceGraphLike;

  if (p.evidence_graph && typeof p.evidence_graph === "object") {
    const graph = p.evidence_graph as Record<string, unknown>;
    if (Array.isArray(graph.events)) return graph as EvidenceGraphLike;
  }

  if (p.outputs && typeof p.outputs === "object") {
    const outputs = p.outputs as Record<string, unknown>;
    if (outputs.evidence_graph && typeof outputs.evidence_graph === "object") {
      const graph = outputs.evidence_graph as Record<string, unknown>;
      if (Array.isArray(graph.events)) return graph as EvidenceGraphLike;
    }
  }

  return null;
}

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [commandCenter, setCommandCenter] = useState<CommandCenterData>({
    claimRows: [],
    causationChains: [],
    collapseCandidates: [],
    contradictionMatrix: [],
    narrativeDuality: null,
    citationFidelity: null,
  });

  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [viewerEnabled, setViewerEnabled] = useState(false);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs],
  );
  const latestRun = completedRuns[0] || null;

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0] || null,
    [events, selectedEventId],
  );

  const documentMap = useMemo(() => {
    const map = new Map<string, Document>();
    for (const d of documents) map.set(d.id, d);
    return map;
  }, [documents]);

  const selectedCitation = selectedEvent?.citations?.[0] || null;
  const selectedDocument = selectedCitation ? documentMap.get(selectedCitation.source_document_id) || null : null;
  const selectedPage = selectedCitation?.page_number || null;
  const viewerHref = selectedDocument
    ? `/api/citeline/documents/${selectedDocument.id}/download${selectedPage ? `#page=${selectedPage}` : ""}`
    : null;

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => (`${e.dateLabel} ${e.eventType} ${e.summary}`).toLowerCase().includes(q));
  }, [events, query]);

  const fetchCaseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matterRes, runsRes, docsRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
        fetch(`/api/citeline/matters/${caseId}/documents`),
      ]);
      if (!matterRes.ok) throw new Error("Unable to load case details.");
      if (!runsRes.ok) throw new Error("Unable to load runs.");
      if (!docsRes.ok) throw new Error("Unable to load documents.");

      const [matterJson, runsJson, docsJson] = await Promise.all([
        matterRes.json(),
        runsRes.json(),
        docsRes.json(),
      ]);

      setMatter(matterJson);
      setRuns(Array.isArray(runsJson) ? runsJson : []);
      setDocuments(Array.isArray(docsJson) ? docsJson : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Audit Mode.");
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  const fetchEvidenceGraph = useCallback(async (runIds: string[]) => {
    setIsGraphLoading(true);
    setError(null);
    try {
      for (const runId of runIds) {
        let res = await fetch(`/api/citeline/runs/${runId}/artifacts/by-name/evidence_graph.json`, { cache: "no-store" });
        if (!res.ok) {
          res = await fetch(`/api/citeline/runs/${runId}/artifacts/json`, { cache: "no-store" });
        }
        if (!res.ok) continue;

        const payload = await res.json();
        const graph = extractGraphPayload(payload);
        if (!graph || !Array.isArray(graph.events) || graph.events.length === 0) continue;

        const pages = Array.isArray(graph.pages) ? graph.pages : [];
        const citations = Array.isArray(graph.citations) ? graph.citations : [];
        const eventsRaw = graph.events;
        const ext =
          graph.extensions && typeof graph.extensions === "object"
            ? (graph.extensions as Record<string, unknown>)
            : {};

        const globalToLocalPage = new Map<number, number>();
        const localByDoc = new Map<string, number>();
        const sortedPages = [...pages].sort((a, b) => Number(a.page_number) - Number(b.page_number));
        for (const p of sortedPages) {
          const docId = String(p.source_document_id || "");
          const local = (localByDoc.get(docId) || 0) + 1;
          localByDoc.set(docId, local);
          globalToLocalPage.set(Number(p.page_number), local);
        }

        const citationById = new Map<string, CitationRecord>();
        for (const c of citations) {
          if (!c?.citation_id) continue;
          const localPage = globalToLocalPage.get(Number(c.page_number));
          citationById.set(c.citation_id, {
            ...c,
            page_number: localPage || c.page_number,
          });
        }

        const transformed = eventsRaw.map((e, idx) => {
          const eventCitations = (e.citation_ids || [])
            .map((id) => citationById.get(id))
            .filter((c): c is CitationRecord => Boolean(c));
          return {
            id: e.event_id || `event-${idx}`,
            dateLabel: parseDateLabel(e),
            eventType: normalizeEventType(e.event_type),
            summary: pickSummary(e),
            confidence: Number.isFinite(e.confidence) ? Number(e.confidence) : 0,
            citations: eventCitations,
          } satisfies AuditEvent;
        });

        transformed.sort((a, b) => `${a.dateLabel}|${a.id}`.localeCompare(`${b.dateLabel}|${b.id}`));
        setEvents(transformed);
        setSelectedEventId((prev) => prev || transformed[0]?.id || null);
        setViewerEnabled(false);
        setCommandCenter({
          claimRows: Array.isArray(ext?.claim_rows) ? ext.claim_rows : [],
          causationChains: Array.isArray(ext?.causation_chains) ? ext.causation_chains : [],
          collapseCandidates: Array.isArray(ext?.case_collapse_candidates) ? ext.case_collapse_candidates : [],
          contradictionMatrix: Array.isArray(ext?.contradiction_matrix) ? ext.contradiction_matrix : [],
          narrativeDuality:
            ext?.narrative_duality && typeof ext.narrative_duality === "object"
              ? (ext.narrative_duality as Record<string, unknown>)
              : null,
          citationFidelity:
            ext?.citation_fidelity && typeof ext.citation_fidelity === "object"
              ? (ext.citation_fidelity as Record<string, unknown>)
              : null,
        });
        return;
      }

      setEvents([]);
      setCommandCenter({
        claimRows: [],
        causationChains: [],
        collapseCandidates: [],
        contradictionMatrix: [],
        narrativeDuality: null,
        citationFidelity: null,
      });
      setError("No extracted event graph found for completed runs. Re-run extraction or check artifact availability.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load evidence data.");
      setEvents([]);
    } finally {
      setIsGraphLoading(false);
    }
  }, []);

  const triggerReprocess = useCallback(async () => {
    setIsReprocessing(true);
    try {
      const res = await fetch(`/api/citeline/matters/${caseId}/runs`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to start new run");
      setError("Reprocessing started. This page will update automatically once extraction completes.");
      await fetchCaseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start reprocessing.");
    } finally {
      setIsReprocessing(false);
    }
  }, [caseId, fetchCaseData]);

  useEffect(() => {
    void fetchCaseData();
  }, [fetchCaseData]);

  useEffect(() => {
    if (completedRuns.length === 0) return;
    void fetchEvidenceGraph(completedRuns.map((r) => r.id));
  }, [completedRuns, fetchEvidenceGraph]);

  useEffect(() => {
    const hasActiveRuns = runs.some((r) => r.status === "pending" || r.status === "running");
    if (!hasActiveRuns) return;
    const timer = setInterval(() => {
      void fetchCaseData();
    }, 5000);
    return () => clearInterval(timer);
  }, [runs, fetchCaseData]);

  useEffect(() => {
    setViewerEnabled(false);
  }, [selectedEventId]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading Audit Mode...
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-background text-foreground">
      <div className="h-14 border-b bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/cases/${caseId}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold">Audit Mode: {matter?.title || "Case Review"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={latestRun ? "default" : "outline"} className="text-[10px] uppercase tracking-wide">
            {latestRun ? "Verification Ready" : "Waiting For Run"}
          </Badge>
          {latestRun && (
            <Button size="sm" asChild>
              <a href={`/api/citeline/runs/${latestRun.id}/artifacts/docx`} target="_blank" rel="noreferrer">
                Export DOCX
              </a>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void triggerReprocess()} disabled={isReprocessing}>
              {isReprocessing ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Starting...
                </>
              ) : (
                "Re-run with latest exporter"
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="mx-6 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Audit Events</div><div className="text-xl font-semibold">{events.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Claims</div><div className="text-xl font-semibold">{commandCenter.claimRows.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Causation Chains</div><div className="text-xl font-semibold">{commandCenter.causationChains.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Contradictions</div><div className="text-xl font-semibold">{commandCenter.contradictionMatrix.length}</div></CardContent></Card>
      </div>

      <div className="flex-1 overflow-hidden mt-4 mx-6 mb-6 grid grid-cols-12 gap-4">
        <div className="col-span-4 border rounded-lg bg-card flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className="w-full border rounded-md py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search events, symptoms, procedures..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isGraphLoading && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading event graph...
              </div>
            )}
            {!isGraphLoading && filteredEvents.length === 0 && (
              <div className="text-sm text-muted-foreground p-2">No events available yet. Run analysis to populate Audit Mode.</div>
            )}
            {filteredEvents.map((e) => {
              const active = selectedEvent?.id === e.id;
              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  className={`w-full text-left border rounded-md p-3 transition ${active ? "border-primary bg-primary/5" : "hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{e.dateLabel}</span>
                    <Badge variant="secondary" className="text-[9px]">{e.eventType}</Badge>
                  </div>
                  <p className="text-xs mt-2 leading-relaxed">{e.summary}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{e.citations.length} citation(s)</span>
                    <span>Confidence {e.confidence}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-8 grid grid-rows-[1.2fr_1fr] gap-4 min-h-0">
          <div className="border rounded-lg bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Record Packet Viewer</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDocument ? `${selectedDocument.filename}${selectedPage ? ` - page ${selectedPage}` : ""}` : "Select an event with citations to open the source packet"}
                </div>
              </div>
              {viewerHref && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setViewerEnabled((v) => !v)}>
                    {viewerEnabled ? "Hide Preview" : "Load Preview"}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={viewerHref} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Source
                    </a>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-muted/60">
              {viewerHref && viewerEnabled ? (
                <iframe title="Source document viewer" src={viewerHref} className="w-full h-full border-0" />
              ) : viewerHref ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" /> Preview is paused. Click Load Preview when needed.
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" /> No source document selected.
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Command Center Signals
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 text-xs overflow-y-auto max-h-[260px]">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> Causation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {commandCenter.causationChains.slice(0, 3).map((row, i) => (
                    <div key={`cause-${i}`} className="border rounded p-2">
                      <div className="font-medium">{String(row["body_region"] || "General")}</div>
                      <div className="text-muted-foreground">Integrity: {String(row["chain_integrity_score"] ?? "n/a")}</div>
                    </div>
                  ))}
                  {commandCenter.causationChains.length === 0 && <div className="text-muted-foreground">No causation chain output.</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Case Collapse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {commandCenter.collapseCandidates.slice(0, 3).map((row, i) => (
                    <div key={`collapse-${i}`} className="border rounded p-2">
                      <div className="font-medium">{String(row["fragility_type"] || "Unknown")}</div>
                      <div className="text-muted-foreground">Score: {String(row["fragility_score"] ?? "n/a")}</div>
                    </div>
                  ))}
                  {commandCenter.collapseCandidates.length === 0 && <div className="text-muted-foreground">No collapse candidates.</div>}
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Selected Event Citations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(selectedEvent?.citations || []).length === 0 && (
                    <div className="text-muted-foreground">No direct citations linked for this event.</div>
                  )}
                  {(selectedEvent?.citations || []).slice(0, 8).map((c) => {
                    const doc = documentMap.get(c.source_document_id);
                    const href = doc ? `/api/citeline/documents/${doc.id}/download#page=${c.page_number}` : null;
                    return (
                      <div key={c.citation_id} className="border rounded p-2 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{doc?.filename || c.source_document_id} p. {c.page_number}</div>
                          <div className="text-muted-foreground">{(c.snippet || "No snippet available.").slice(0, 220)}</div>
                        </div>
                        {href && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={href} target="_blank" rel="noreferrer">Open</a>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
