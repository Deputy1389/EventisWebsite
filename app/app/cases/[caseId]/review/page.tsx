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

function causationSummary(row: Record<string, unknown>): string {
  // Try legacy keys first
  for (const k of ["causation_thesis", "summary", "narrative"]) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // Build from actual pipeline data shape
  const rungs = Array.isArray(row.rungs) ? row.rungs : [];
  const missing = Array.isArray(row.missing_rungs) ? row.missing_rungs : [];
  const score = typeof row.chain_integrity_score === "number" ? row.chain_integrity_score : null;
  if (rungs.length === 0 && score === null) return "No details.";
  const rungLabels = rungs.slice(0, 6).map((r: Record<string, unknown>) => {
    const rtype = String(r?.rung_type || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const rdate = String(r?.date || "");
    return rdate && rdate !== "unknown" ? `${rtype} (${rdate})` : rtype;
  }).filter(Boolean);
  const parts: string[] = [];
  if (rungLabels.length) parts.push(rungLabels.join(" → "));
  if (score !== null) parts.push(`Integrity: ${score}/100`);
  if (missing.length) parts.push(`Missing: ${missing.map((m: string) => String(m).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())).join(", ")}`);
  return parts.join(" | ") || "No details.";
}

function contradictionSummary(row: Record<string, unknown>): string {
  // Try legacy keys first
  for (const k of ["description", "analysis", "summary"]) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // Build from actual pipeline data shape
  const supporting = row.supporting as Record<string, unknown> | undefined;
  const contradicting = row.contradicting as Record<string, unknown> | undefined;
  if (!supporting && !contradicting) return "No details.";
  const sVal = String(supporting?.value || "").replace(/_/g, " ");
  const cVal = String(contradicting?.value || "").replace(/_/g, " ");
  const sDate = String(supporting?.date || "");
  const cDate = String(contradicting?.date || "");
  const delta = typeof row.strength_delta === "number" ? row.strength_delta : null;
  const parts: string[] = [];
  if (sVal || cVal) {
    parts.push(`${sVal}${sDate ? ` (${sDate})` : ""} vs ${cVal}${cDate ? ` (${cDate})` : ""}`);
  }
  if (delta !== null) parts.push(`Strength delta: ${delta}`);
  return parts.join(" | ") || "No details.";
}

function countMoatSignals(ext: Record<string, unknown>): number {
  const keys = [
    "claim_rows",
    "causation_chains",
    "case_collapse_candidates",
    "defense_attack_paths",
    "objection_profiles",
    "evidence_upgrade_recommendations",
    "quote_lock_rows",
    "contradiction_matrix",
  ] as const;
  let total = 0;
  for (const key of keys) {
    const value = ext[key];
    if (Array.isArray(value)) total += value.length;
  }
  if (ext.narrative_duality && typeof ext.narrative_duality === "object") total += 1;
  if (ext.citation_fidelity && typeof ext.citation_fidelity === "object") total += 1;
  return total;
}



function deriveTags(eventType: string, summary: string): string[] {
  const blob = `${eventType} ${summary}`.toLowerCase();
  const tags = new Set<string>();
  if (/(imaging|mri|ct|xray)/.test(blob)) tags.add("Imaging");
  if (/(surgery|procedure|injection|epidural)/.test(blob)) tags.add("Escalation");
  if (/(pain|radiculopathy|strain|sprain)/.test(blob)) tags.add("Damages");
  if (/(mechanism|mvc|incident|injury)/.test(blob)) tags.add("Causation");
  if (/(plateau|no change|unchanged)/.test(blob)) tags.add("Plateau");
  if (/(contradiction|denies|inconsistent)/.test(blob)) tags.add("Defense Exposure");
  return [...tags];
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
  const [viewerMode, setViewerMode] = useState<"source" | "chronology">("source");
  const [viewerKey, setViewerKey] = useState(0);
  
  
  const [docPageCounts, setDocPageCounts] = useState<Record<string, number>>({});
  const [activePanel, setActivePanel] = useState<"strategic" | "summary" | "chronology" | "vault">("strategic");

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
  
  const viewerHref = viewerMode === "chronology" && latestRun
    ? `/api/citeline/runs/${latestRun.id}/artifacts/pdf`
    : selectedDocument
      ? `/api/citeline/documents/${selectedDocument.id}/download?v=${viewerKey}${selectedPage ? `#page=${selectedPage}` : ""}`
      : null;

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => (`${e.dateLabel} ${e.eventType} ${e.summary}`).toLowerCase().includes(q));
  }, [events, query]);

  const fetchCaseData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) setIsLoading(false);
    }
  }, [caseId]);

  const fetchEvidenceGraph = useCallback(async (runIds: string[]) => {
    setIsGraphLoading(true);
    setError(null);
    try {
      let bestCandidate: {
        events: AuditEvent[];
        commandCenter: CommandCenterData;
        score: number;
      } | null = null;

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
        setDocPageCounts(Object.fromEntries(localByDoc.entries()));

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
        const nextCommandCenter: CommandCenterData = {
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
          qualityGate: asRecord(ext?.quality_gate),
        };

        const moatScore =
          countMoatSignals(ext) +
          transformed.length * 0.001;

        if (!bestCandidate || moatScore > bestCandidate.score) {
          bestCandidate = {
            events: transformed,
            commandCenter: nextCommandCenter,
            score: moatScore,
          };
        }

        if (countMoatSignals(ext) > 0) {
          break;
        }
      }

      if (bestCandidate) {
        setEvents(bestCandidate.events);
        setSelectedEventId((prev) => prev || bestCandidate.events.find((t) => t.citations.length > 0)?.id || bestCandidate.events[0]?.id || null);
        setSelectedCitationId((prev) => prev || null);
        setViewerEnabled(false);
        setCommandCenter(bestCandidate.commandCenter);
        return;
      }

      setEvents([]);
      setDocPageCounts({});
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
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(parseApiError(errorText) || "Failed to start new run");
      }
      setError(null);
      await fetchCaseData(true);
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
      void fetchCaseData(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [runs, fetchCaseData]);

  useEffect(() => {
    if (selectedEvent?.citations?.length) {
      setSelectedCitationId(selectedEvent.citations[0].citation_id);
      setViewerEnabled(true);
      setViewerMode("source");
      setViewerKey((k) => k + 1);
      return;
    }
    setViewerEnabled(false);
  }, [selectedEvent]);

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
    setViewerKey((k) => k + 1);
  }, [selectedEvent, selectedCitationId]);

  const focusCitation = useCallback((citationId: string) => {
    for (const event of events) {
      const found = event.citations.find((c) => c.citation_id === citationId);
      if (!found) continue;
      setSelectedEventId(event.id);
      setSelectedCitationId(citationId);
      setViewerEnabled(true);
      setViewerMode("source");
      setViewerKey((k) => k + 1);
      
      return;
    }
  }, [events]);

  const contradictionCountByEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      const eventCitationSet = new Set(event.citations.map((c) => c.citation_id));
      let count = 0;
      for (const row of commandCenter.contradictionMatrix) {
        const rowCitations = new Set(collectCitationIds(row));
        let overlap = false;
        for (const cid of rowCitations) {
          if (eventCitationSet.has(cid)) {
            overlap = true;
            break;
          }
        }
        if (overlap) count += 1;
      }
      map.set(event.id, count);
    }
    return map;
  }, [commandCenter.contradictionMatrix, events]);

  const matterTitle = matter?.title || "Untitled Matter";
  const packetFilename = documents[0]?.filename || "No packet";
  const packetPages = Number(latestRun?.metrics?.pages_total || 0);
  const anchoredEvents = events.filter((e) => e.citations.length > 0).length;
  const citationCoverage = events.length ? Math.round((anchoredEvents / events.length) * 100) : 0;
  const auditScoreRaw = latestRun?.metrics?.audit_score;
  
  const qualityGate = commandCenter.qualityGate || {};
  const filteredCount = Number(qualityGate.num_snippets_filtered || 0);
  
  
  
  
  const chronologyIntegrity = Math.min(100, Math.round((anchoredEvents / Math.max(1, events.length)) * 100));

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing Audit Mode...</p>
      </div>
    );
  }

  const hasActiveRuns = runs.some((r) => r.status === "pending" || r.status === "running");

  // If no events found yet, but a run is active, show the "Processing" stable screen
  if (events.length === 0 && hasActiveRuns) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/app/cases/${caseId}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold truncate">Audit Mode: {matterTitle}</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Medical Records</h2>
          <p className="text-muted-foreground mb-8">
            Our clinical models are currently extracting events, establishing causation chains, and verifying citations.
            This usually takes 5-10 minutes.
          </p>
          <div className="w-full space-y-4 text-left bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Initializing workspace...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Extracted clinical events...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
              <span className="text-muted-foreground">Generating strategic moat...</span>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            This page will automatically refresh as soon as results are ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen -m-8 flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/cases/${caseId}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 min-w-0">
            <Scale className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold truncate">Audit Mode: {matterTitle}</h1>
          </div>
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-muted-foreground ml-4">
            <Badge variant="outline">{packetFilename}</Badge>
            <Badge variant="outline">{packetPages || "?"} pages</Badge>
            <Badge variant="outline">Integrity {chronologyIntegrity}/100</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={latestRun ? "default" : "outline"} className="text-[10px] uppercase tracking-wide">
            {hasActiveRuns ? "Processing" : latestRun ? "Ready" : "Waiting"}
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

      {error && !hasActiveRuns && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => void triggerReprocess()} disabled={isReprocessing}>
              {isReprocessing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              {isReprocessing ? "Starting..." : "Re-run"}
            </Button>
          </div>
        </div>
      )}

      {/* Three-Pane Content */}
      <div className="flex-1 overflow-hidden flex divide-x">
        {/* Pane 1: Timeline (Master) */}
        <div className="w-[320px] xl:w-[380px] flex flex-col bg-card shrink-0">
          <div className="p-3 border-b bg-muted/5 flex items-center justify-between">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timeline</span>
                <Button 
                  size="sm" 
                  variant={viewerMode === "chronology" ? "default" : "outline"} 
                  className="h-7 text-[10px] px-2"
                  onClick={() => {
                    setViewerMode("chronology");
                    setViewerEnabled(true);
                    setViewerKey(k => k + 1);
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" /> View Full Chronology PDF
                </Button>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{filteredEvents.length} Events</span>
          </div>
          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className="w-full border rounded-md py-2 pl-8 pr-3 text-xs bg-background"
                placeholder="Search chronology..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isGraphLoading ? (
              <div className="text-xs text-muted-foreground text-center p-8">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" /> Loading...
              </div>
            ) : filteredEvents.map((e) => {
              const active = selectedEvent?.id === e.id;
              const contradictionCount = contradictionCountByEvent.get(e.id) || 0;
              const tags = deriveTags(e.eventType, e.summary);
              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => {
                    setSelectedEventId(e.id);
                    setViewerEnabled(true);
                  }}
                  className={`w-full text-left border rounded-lg p-3 transition-all ${active ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20 shadow-sm" : "hover:border-primary/40 bg-background"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-foreground">{e.dateLabel}</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1">{e.eventType}</Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">{e.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {contradictionCount > 0 && <Badge variant="destructive" className="text-[8px] h-4 px-1">Conflict</Badge>}
                    {tags.slice(0, 2).map((t) => <Badge key={`${e.id}-${t}`} variant="outline" className="text-[8px] h-4 px-1">{t}</Badge>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pane 2: Context Dock (Detail) */}
        <div className="w-[300px] xl:w-[350px] flex flex-col bg-muted/5 shrink-0">
          <div className="p-3 border-b flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Strategic Context</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!selectedEvent ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-background/50">
                <FileText className="h-8 w-8 text-primary/40 mb-3" />
                <div className="text-sm font-semibold mb-1">No Event Selected</div>
                <p className="text-[11px] text-muted-foreground mb-4">Click any timeline event to see its specific risks and source evidence.</p>
                <div className="w-full h-px bg-border mb-4" />
                <Button 
                  variant="secondary" 
                  className="w-full text-xs h-9"
                  onClick={() => {
                    setViewerMode("chronology");
                    setViewerEnabled(true);
                    setViewerKey(k => k + 1);
                  }}
                >
                  Open Generated Chronology PDF
                </Button>
              </div>
            ) : (
              <>
                {/* Related Moat Signals for Selected Event */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Signals & Risks</div>
                  
                  {/* Filtered Moat components based on selected citation */}
                  {[...commandCenter.contradictionMatrix, ...commandCenter.claimRows, ...commandCenter.defenseAttackPaths].filter(row => {
                    const cites = collectCitationIds(row);
                    const eventCites = new Set(selectedEvent.citations.map(c => c.citation_id));
                    return cites.some(c => eventCites.has(c));
                  }).length === 0 ? (
                    <div className="text-[11px] text-muted-foreground italic">No direct strategic flags for this event.</div>
                  ) : (
                    [...commandCenter.contradictionMatrix, ...commandCenter.claimRows, ...commandCenter.defenseAttackPaths].filter(row => {
                      const cites = collectCitationIds(row);
                      const eventCites = new Set(selectedEvent.citations.map(c => c.citation_id));
                      return cites.some(c => eventCites.has(c));
                    }).map((row, idx) => (
                      <div key={`sel-moat-${idx}`} className="p-3 rounded-lg border bg-background shadow-sm text-xs space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{textFrom(row, ["claim_type", "category", "attack"], "Signal")}</span>
                            <Badge variant="outline" className="text-[8px]">Linked</Badge>
                         </div>
                         <p className="text-muted-foreground leading-snug">{textFrom(row, ["assertion", "summary", "description", "why"], "No details.")}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Event Metadata */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evidence</div>
                  <div className="grid gap-2">
                    {selectedEvent.citations.map((c, idx) => (
                      <button 
                        key={`cite-${idx}`} 
                        onClick={() => setSelectedCitationId(c.citation_id)}
                        className={`text-left p-2 rounded border text-[10px] transition-colors ${selectedCitationId === c.citation_id ? "border-primary bg-primary/5" : "hover:bg-background"}`}
                      >
                        <div className="font-medium truncate">Page {c.page_number}</div>
                        <div className="text-muted-foreground truncate">{c.snippet || "View source excerpt..."}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pane 3: Document Viewer */}
        <div className="flex-1 flex flex-col bg-card min-w-0">
          <div className="h-12 px-4 border-b flex items-center justify-between bg-background shrink-0">
            <div className="flex items-center gap-4">
              <div className="text-xs font-medium text-muted-foreground">
                {selectedDocument ? `${selectedDocument.filename} - Page ${selectedPage}` : "Document Viewer"}
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant={viewerMode === "source" ? "secondary" : "ghost"} className="h-7 text-[10px]" onClick={() => setViewerMode("source")}>Source</Button>
                <Button size="sm" variant={viewerMode === "chronology" ? "secondary" : "ghost"} className="h-7 text-[10px]" onClick={() => setViewerMode("chronology")}>PDF</Button>
              </div>
            </div>
            {viewerHref && (
              <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
                <a href={viewerHref} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" /> Popout</a>
              </Button>
            )}
          </div>
          <div className="flex-1 bg-muted/20 relative p-1">
            {viewerHref && viewerEnabled ? (
              <iframe key={viewerKey} title="Document viewer" src={viewerHref} className="w-full h-full border rounded-md bg-white shadow-lg" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-xs">Click an event to load evidence.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
