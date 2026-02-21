"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ExternalLink,
  FileText,
  Loader2,
  Scale,
  Search,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  objectionProfiles: Record<string, unknown>[];
  evidenceUpgradeRecommendations: Record<string, unknown>[];
  quoteLockRows: Record<string, unknown>[];
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

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((v): v is Record<string, unknown> => Boolean(v) && typeof v === "object") : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function toStringId(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function collectCitationIds(row: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const directKeys = ["citation_id", "primary_citation_id"] as const;
  for (const key of directKeys) {
    const id = toStringId(row[key]);
    if (id) out.add(id);
  }

  const listKeys = [
    "citation_ids",
    "supporting_citation_ids",
    "source_citation_ids",
    "quote_lock_citation_ids",
  ] as const;
  for (const key of listKeys) {
    const raw = row[key];
    if (!Array.isArray(raw)) continue;
    for (const value of raw) {
      const id = toStringId(value);
      if (id) out.add(id);
    }
  }

  const citationsRaw = row.citations;
  if (Array.isArray(citationsRaw)) {
    for (const value of citationsRaw) {
      if (typeof value === "string" || typeof value === "number") {
        out.add(String(value));
        continue;
      }
      if (!value || typeof value !== "object") continue;
      const record = value as Record<string, unknown>;
      const id = toStringId(record.citation_id ?? record.id);
      if (id) out.add(id);
    }
  }

  return [...out];
}

function textFrom(row: Record<string, unknown>, keys: string[], fallback = "N/A"): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
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
    defenseAttackPaths: [],
    objectionProfiles: [],
    evidenceUpgradeRecommendations: [],
    quoteLockRows: [],
    contradictionMatrix: [],
    narrativeDuality: null,
    citationFidelity: null,
  });

  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [viewerEnabled, setViewerEnabled] = useState(false);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs],
  );
  const latestRun = completedRuns[0] || null;

  const selectedEvent = useMemo(
    () => {
      const preferred = events.find((e) => e.id === selectedEventId);
      if (preferred) return preferred;
      const withCitations = events.find((e) => e.citations.length > 0);
      return withCitations || events[0] || null;
    },
    [events, selectedEventId],
  );

  const documentMap = useMemo(() => {
    const map = new Map<string, Document>();
    for (const d of documents) map.set(String(d.id), d);
    return map;
  }, [documents]);

  const selectedCitation = useMemo(() => {
    if (!selectedEvent) return null;
    if (selectedCitationId) {
      const explicit = selectedEvent.citations.find((c) => String(c.citation_id) === selectedCitationId);
      if (explicit) return explicit;
    }
    return selectedEvent.citations[0] || null;
  }, [selectedCitationId, selectedEvent]);

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
        const citationIdsByGlobalPage = new Map<number, string[]>();
        for (const c of citations) {
          const cid = toStringId(c?.citation_id);
          if (!cid) continue;
          const globalPage = Number(c.page_number);
          if (Number.isFinite(globalPage)) {
            const bucket = citationIdsByGlobalPage.get(globalPage) || [];
            bucket.push(cid);
            citationIdsByGlobalPage.set(globalPage, bucket);
          }
          const localPage = globalToLocalPage.get(Number(c.page_number));
          citationById.set(cid, {
            ...c,
            citation_id: cid,
            source_document_id: String(c.source_document_id || ""),
            page_number: localPage || c.page_number,
          });
        }

        const transformed = eventsRaw.map((e, idx) => {
          const linkedCitationIds = new Set<string>();
          for (const id of e.citation_ids || []) {
            const normalized = toStringId(id);
            if (normalized) linkedCitationIds.add(normalized);
          }
          for (const fact of e.facts || []) {
            const singleId = toStringId(fact?.citation_id);
            if (singleId) linkedCitationIds.add(singleId);
            for (const id of fact?.citation_ids || []) {
              const normalized = toStringId(id);
              if (normalized) linkedCitationIds.add(normalized);
            }
          }
          for (const pageNo of e.source_page_numbers || []) {
            const ids = citationIdsByGlobalPage.get(Number(pageNo)) || [];
            for (const id of ids) linkedCitationIds.add(id);
          }

          const eventCitations = [...linkedCitationIds]
            .map((id) => citationById.get(id))
            .filter((c): c is CitationRecord => Boolean(c))
            .sort((a, b) => `${a.source_document_id}|${a.page_number}`.localeCompare(`${b.source_document_id}|${b.page_number}`));

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
        setSelectedEventId((prev) => prev || transformed.find((t) => t.citations.length > 0)?.id || transformed[0]?.id || null);
        setSelectedCitationId((prev) => prev || null);
        setViewerEnabled(false);
        setCommandCenter({
          claimRows: asRecordArray(ext?.claim_rows),
          causationChains: asRecordArray(ext?.causation_chains),
          collapseCandidates: asRecordArray(ext?.case_collapse_candidates),
          defenseAttackPaths: asRecordArray(ext?.defense_attack_paths),
          objectionProfiles: asRecordArray(ext?.objection_profiles),
          evidenceUpgradeRecommendations: asRecordArray(ext?.evidence_upgrade_recommendations),
          quoteLockRows: asRecordArray(ext?.quote_lock_rows),
          contradictionMatrix: asRecordArray(ext?.contradiction_matrix),
          narrativeDuality: asRecord(ext?.narrative_duality),
          citationFidelity: asRecord(ext?.citation_fidelity),
        });
        return;
      }

      setEvents([]);
      setCommandCenter({
        claimRows: [],
        causationChains: [],
        collapseCandidates: [],
        defenseAttackPaths: [],
        objectionProfiles: [],
        evidenceUpgradeRecommendations: [],
        quoteLockRows: [],
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

  useEffect(() => {
    if (!selectedEvent) {
      setSelectedCitationId(null);
      return;
    }
    if (!selectedCitationId) {
      setSelectedCitationId(selectedEvent.citations[0]?.citation_id || null);
      return;
    }
    const exists = selectedEvent.citations.some((c) => c.citation_id === selectedCitationId);
    if (!exists) {
      setSelectedCitationId(selectedEvent.citations[0]?.citation_id || null);
    }
  }, [selectedEvent, selectedCitationId]);

  const focusCitation = useCallback((citationId: string) => {
    for (const event of events) {
      const found = event.citations.find((c) => c.citation_id === citationId);
      if (!found) continue;
      setSelectedEventId(event.id);
      setSelectedCitationId(citationId);
      setViewerEnabled(true);
      return;
    }
  }, [events]);

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
      <div className="mx-6 mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Case Collapse</div><div className="text-xl font-semibold">{commandCenter.collapseCandidates.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Defense Paths</div><div className="text-xl font-semibold">{commandCenter.defenseAttackPaths.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Objection Profiles</div><div className="text-xl font-semibold">{commandCenter.objectionProfiles.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Evidence Upgrades</div><div className="text-xl font-semibold">{commandCenter.evidenceUpgradeRecommendations.length}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Quote Locks</div><div className="text-xl font-semibold">{commandCenter.quoteLockRows.length}</div></CardContent></Card>
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

        <div className="col-span-8 grid grid-rows-[1.05fr_1.35fr] gap-4 min-h-0">
          <div className="border rounded-lg bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Record Packet Viewer</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDocument ? `${selectedDocument.filename}${selectedPage ? ` - page ${selectedPage}` : ""}` : "Select an event or signal citation to open the source packet"}
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

          <div className="border rounded-lg bg-card overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Command Center Signals
              </div>
            </div>
            <Tabs defaultValue="overview" className="h-full">
              <TabsList className="mx-4 mt-3 grid grid-cols-3 md:grid-cols-7 w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="causation">Causation</TabsTrigger>
                <TabsTrigger value="collapse">Collapse</TabsTrigger>
                <TabsTrigger value="contradictions">Contradictions</TabsTrigger>
                <TabsTrigger value="narrative">Narrative</TabsTrigger>
                <TabsTrigger value="defense">Defense</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3"><div className="text-muted-foreground">Claim Rows</div><div className="text-lg font-semibold">{commandCenter.claimRows.length}</div></CardContent></Card>
                  <Card><CardContent className="p-3"><div className="text-muted-foreground">Citation Fidelity</div><div className="text-lg font-semibold">{commandCenter.citationFidelity ? "Ready" : "Missing"}</div></CardContent></Card>
                </div>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Selected Event Citations</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {(selectedEvent?.citations || []).length === 0 && (
                      <div className="text-muted-foreground">No direct citations linked for this event.</div>
                    )}
                    {(selectedEvent?.citations || []).slice(0, 12).map((c) => {
                      const doc = documentMap.get(c.source_document_id);
                      const href = doc ? `/api/citeline/documents/${doc.id}/download#page=${c.page_number}` : null;
                      return (
                        <div key={c.citation_id} className="border rounded p-2 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">{doc?.filename || c.source_document_id} p. {c.page_number}</div>
                            <div className="text-muted-foreground">{(c.snippet || "No snippet available.").slice(0, 220)}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="secondary" onClick={() => { setSelectedCitationId(c.citation_id); setViewerEnabled(true); }}>
                              Preview
                            </Button>
                            {href && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={href} target="_blank" rel="noreferrer">Open</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="claims" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-2">
                {commandCenter.claimRows.length === 0 && <div className="text-muted-foreground">No claim rows found in this run.</div>}
                {commandCenter.claimRows.map((row, idx) => {
                  const citationIds = collectCitationIds(row);
                  return (
                    <div key={`claim-${idx}`} className="border rounded-md p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{textFrom(row, ["claim_type"], "Claim")}</div>
                        <div className="text-muted-foreground">{textFrom(row, ["date"], "Undated")}</div>
                      </div>
                      <div className="text-muted-foreground mt-1">{textFrom(row, ["body_region", "provider"], "General")}</div>
                      <div className="mt-2 leading-relaxed">{textFrom(row, ["assertion", "claim_text", "summary"], "No claim text available.")}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-muted-foreground">Support: {textFrom(row, ["support_score", "support_strength"], "n/a")}</div>
                        {citationIds[0] && (
                          <Button size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>
                            Open Citation
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="causation" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-2">
                {commandCenter.causationChains.length === 0 && <div className="text-muted-foreground">No causation chain output.</div>}
                {commandCenter.causationChains.map((row, idx) => {
                  const citationIds = collectCitationIds(row);
                  const rungs = Array.isArray(row.rungs) ? row.rungs.length : 0;
                  return (
                    <div key={`cause-${idx}`} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{textFrom(row, ["body_region"], "General")}</div>
                        <Badge variant="secondary">Integrity {textFrom(row, ["chain_integrity_score"], "n/a")}</Badge>
                      </div>
                      <div className="mt-1 text-muted-foreground">{rungs} rung(s) in chain</div>
                      <div className="mt-2">{textFrom(row, ["causation_thesis", "summary"], "No causation summary.")}</div>
                      {citationIds[0] && <Button className="mt-2" size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>Open Citation</Button>}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="collapse" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-2">
                {commandCenter.collapseCandidates.length === 0 && <div className="text-muted-foreground">No case collapse candidates.</div>}
                {commandCenter.collapseCandidates.map((row, idx) => {
                  const citationIds = collectCitationIds(row);
                  return (
                    <div key={`collapse-${idx}`} className="border rounded-md p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{textFrom(row, ["fragility_type", "title"], "Fragility Candidate")}</div>
                        <Badge variant="secondary">Score {textFrom(row, ["fragility_score", "risk_score"], "n/a")}</Badge>
                      </div>
                      <div className="mt-2">{textFrom(row, ["argument", "reasoning", "summary"], "No details available.")}</div>
                      {citationIds[0] && <Button className="mt-2" size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>Open Citation</Button>}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="contradictions" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-2">
                {commandCenter.contradictionMatrix.length === 0 && <div className="text-muted-foreground">No contradiction matrix output.</div>}
                {commandCenter.contradictionMatrix.map((row, idx) => {
                  const citationIds = collectCitationIds(row);
                  return (
                    <div key={`contra-${idx}`} className="border rounded-md p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{textFrom(row, ["contradiction_type", "label", "category"], "Contradiction")}</div>
                        <Badge variant="secondary">{textFrom(row, ["severity", "materiality", "risk"], "n/a")}</Badge>
                      </div>
                      <div className="mt-2">{textFrom(row, ["description", "analysis", "summary"], "No contradiction description.")}</div>
                      {citationIds[0] && <Button className="mt-2" size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>Open Citation</Button>}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="narrative" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-3">
                {!commandCenter.narrativeDuality && <div className="text-muted-foreground">No narrative duality output.</div>}
                {commandCenter.narrativeDuality && (
                  <>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-xs">Plaintiff Narrative</CardTitle></CardHeader>
                      <CardContent>{textFrom(commandCenter.narrativeDuality, ["plaintiff_narrative", "plaintiff", "plaintiff_theory"], "No plaintiff narrative available.")}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-xs">Defense Narrative</CardTitle></CardHeader>
                      <CardContent>{textFrom(commandCenter.narrativeDuality, ["defense_narrative", "defense", "defense_theory"], "No defense narrative available.")}</CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="defense" className="h-[calc(100%-52px)] p-4 overflow-y-auto text-xs space-y-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Defense Attack Paths ({commandCenter.defenseAttackPaths.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {commandCenter.defenseAttackPaths.length === 0 && <div className="text-muted-foreground">No defense attack paths.</div>}
                    {commandCenter.defenseAttackPaths.map((row, idx) => (
                      <div key={`attack-${idx}`} className="border rounded-md p-2">
                        <div className="font-medium">{textFrom(row, ["attack_vector", "title"], "Attack Path")}</div>
                        <div className="text-muted-foreground mt-1">{textFrom(row, ["description", "summary"], "No details.")}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Objection Profiles ({commandCenter.objectionProfiles.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {commandCenter.objectionProfiles.length === 0 && <div className="text-muted-foreground">No objection profiles.</div>}
                    {commandCenter.objectionProfiles.map((row, idx) => (
                      <div key={`obj-${idx}`} className="border rounded-md p-2">
                        <div className="font-medium">{textFrom(row, ["objection_type", "title"], "Objection")}</div>
                        <div className="text-muted-foreground mt-1">{textFrom(row, ["reasoning", "summary"], "No details.")}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Evidence Upgrades ({commandCenter.evidenceUpgradeRecommendations.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {commandCenter.evidenceUpgradeRecommendations.length === 0 && <div className="text-muted-foreground">No evidence upgrade recommendations.</div>}
                    {commandCenter.evidenceUpgradeRecommendations.map((row, idx) => (
                      <div key={`upgrade-${idx}`} className="border rounded-md p-2">
                        <div className="font-medium">{textFrom(row, ["recommendation", "title"], "Recommendation")}</div>
                        <div className="text-muted-foreground mt-1">{textFrom(row, ["justification", "summary"], "No details.")}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
