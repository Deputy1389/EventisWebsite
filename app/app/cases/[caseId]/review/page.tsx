"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronsDown,
  ChevronsUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function deriveImpact(score: number): "Low" | "Med" | "High" {
  if (score >= 70) return "High";
  if (score >= 40) return "Med";
  return "Low";
}

function deriveSeverity(eventType: string, summary: string): "Low" | "Med" | "High" {
  const blob = `${eventType} ${summary}`.toLowerCase();
  if (/(surgery|procedure|hospital|admission|discharge|er|emergency|fracture|herniation)/.test(blob)) return "High";
  if (/(imaging|mri|ct|xray|injection|epidural|radiculopathy|severe)/.test(blob)) return "Med";
  return "Low";
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
  const [mobilePane, setMobilePane] = useState<"events" | "viewer">("events");
  const [dockCollapsed, setDockCollapsed] = useState(false);
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
  const selectedDocumentPages = selectedDocument ? docPageCounts[selectedDocument.id] || null : null;
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
      setMobilePane("viewer");
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
  const auditScore = typeof auditScoreRaw === "number" ? String(Math.round(auditScoreRaw)) : "N/A";
  const qualityGate = commandCenter.qualityGate || {};
  const filteredCount = Number(qualityGate.num_snippets_filtered || 0);
  const cleanedCount = Number(qualityGate.num_snippets_cleaned || 0);
  const noiseRisk = filteredCount > 10 ? "High" : filteredCount > 3 ? "Med" : "Low";
  const evidenceCoverageLabel = citationCoverage >= 70 ? "Strong" : citationCoverage >= 40 ? "Moderate" : "Weak";
  const defenseRisk = commandCenter.defenseAttackPaths.length > 0 || commandCenter.contradictionMatrix.length > 0 ? "Med" : "Low";
  const chronologyIntegrity = Math.min(100, Math.round((anchoredEvents / Math.max(1, events.length)) * 100));

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
      <div className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30">
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
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-muted-foreground">
            <Badge variant="outline">{packetFilename}</Badge>
            <Badge variant="outline">{packetPages || "?"} pages</Badge>
            <Badge variant="outline">Chronology Integrity {chronologyIntegrity}/100</Badge>
            <Badge variant="outline">Evidence Coverage {evidenceCoverageLabel}</Badge>
            <Badge variant="outline">Noise Risk {noiseRisk}</Badge>
            <Badge variant="outline">Defense Risk {defenseRisk}</Badge>
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

      <div className="mx-6 mt-3 space-y-2">
        {events.length > 0 && commandCenter.claimRows.length === 0 && (
          <div className="rounded-md border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-sm">
            Events extracted. Promote an event to create a Claim.
          </div>
        )}
        {events.length > 0 && anchoredEvents === 0 && (
          <div className="rounded-md border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm">
            Citation anchoring incomplete. Review extraction settings.
          </div>
        )}
      </div>

      <div className="mx-6 mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant={activePanel === "strategic" ? "default" : "outline"} onClick={() => setActivePanel("strategic")}>
          Strategic Overview
        </Button>
        <Button size="sm" variant={activePanel === "summary" ? "default" : "outline"} onClick={() => setActivePanel("summary")}>
          Injury Arc
        </Button>
        <Button size="sm" variant={activePanel === "chronology" ? "default" : "outline"} onClick={() => setActivePanel("chronology")}>
          Chronology
        </Button>
        <Button size="sm" variant={activePanel === "vault" ? "default" : "outline"} onClick={() => setActivePanel("vault")}>
          Evidence Vault
        </Button>
      </div>

      {activePanel === "strategic" && (
        <div className="mx-6 mt-3 mb-6 grid gap-4">
          <div className="border rounded-lg bg-card p-4">
            <div className="text-sm font-semibold mb-3">Strategic Overview (Moat)</div>
            {countMoatSignals(commandCenter as Record<string, unknown>) === 0 ? (
              <div className="text-sm text-muted-foreground">No strategic flags detected in this record set.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {[...commandCenter.collapseCandidates, ...commandCenter.defenseAttackPaths, ...commandCenter.contradictionMatrix, ...commandCenter.causationChains].slice(0, 10).map((row, idx) => {
                  const score = Number(row.fragility_score || row.confidence || 50);
                  const impact = deriveImpact(score);
                  const citationIds = collectCitationIds(row);
                  return (
                    <div key={`moat-${idx}`} className="border rounded-md p-3 text-xs space-y-2">
                      <div className="font-medium">{textFrom(row, ["title", "fragility_type", "attack", "category", "body_region"], "Strategic Signal")}</div>
                      <div className="text-muted-foreground">{textFrom(row, ["why", "path", "description", "analysis", "summary", "causation_thesis"], "Litigation implication not available.")}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Impact {impact}</Badge>
                        <Badge variant="outline">Confidence {Math.round(score)}</Badge>
                        <Badge variant="outline">Cites {citationIds.length}</Badge>
                        {citationIds[0] && <Button size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>View Evidence</Button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activePanel === "summary" && (
        <div className="mx-6 mt-3 mb-6 grid gap-4">
          <div className="border rounded-lg bg-card p-4 space-y-3">
            <div className="text-sm font-semibold">Injury Arc Summary</div>
            <div className="text-sm text-muted-foreground">
              Anchored events: {anchoredEvents} of {events.length}. Evidence coverage: {evidenceCoverageLabel}. Noise risk: {noiseRisk}.
            </div>
            <div className="space-y-2">
              {events.slice(0, 5).map((e) => (
                <div key={`summary-${e.id}`} className="border rounded-md p-2 text-xs">
                  <div className="font-medium">{e.dateLabel} - {e.eventType}</div>
                  <div className="text-muted-foreground">{e.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePanel === "chronology" && (
        <div className={`flex-1 overflow-hidden mt-3 mx-6 ${selectedEvent ? "mb-2" : "mb-6"} grid [@media(min-width:1100px)]:grid-cols-[35%_65%] gap-4`}>
          <div className={`border rounded-lg bg-card flex flex-col overflow-hidden ${mobilePane === "viewer" ? "hidden [@media(min-width:1100px)]:flex" : "flex"}`}>
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
                const contradictionCount = contradictionCountByEvent.get(e.id) || 0;
                const tags = deriveTags(e.eventType, e.summary);
                const severity = deriveSeverity(e.eventType, e.summary);
                return (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => setSelectedEventId(e.id)}
                    className={`w-full text-left border rounded-md p-3 transition ${active ? "border-primary bg-primary/5" : "hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{e.dateLabel}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[9px]">{e.eventType}</Badge>
                        <Badge variant="outline" className="text-[9px]">Severity {severity}</Badge>
                        {contradictionCount > 0 && <Badge variant="destructive" className="text-[9px]">Conflicts {contradictionCount}</Badge>}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((t) => <Badge key={`${e.id}-${t}`} variant="outline" className="text-[9px]">{t}</Badge>)}
                    </div>
                    <p className="text-xs mt-2 leading-relaxed line-clamp-2">{e.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{e.citations.length} cites</span>
                      <span>{e.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`border rounded-lg bg-card flex flex-col overflow-hidden ${mobilePane === "events" ? "hidden [@media(min-width:1100px)]:flex" : "flex"} min-h-0`}>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Record Packet Viewer</div>
                <div className="text-xs text-muted-foreground">
                  {selectedDocument ? `${selectedDocument.filename}${selectedPage ? ` - page ${selectedPage}` : ""}` : "Select an event with citations to open the source packet"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={viewerMode === "source" ? "default" : "outline"} onClick={() => {
                  setViewerMode("source");
                  setViewerEnabled(true);
                  setViewerKey((k) => k + 1);
                }}>
                  Source Packet
                </Button>
                {latestRun && (
                  <Button size="sm" variant={viewerMode === "chronology" ? "default" : "outline"} onClick={() => {
                    setViewerMode("chronology");
                    setViewerEnabled(true);
                    setViewerKey((k) => k + 1);
                  }}>
                    Chronology PDF
                  </Button>
                )}
                {viewerHref && (
                  <Button size="sm" onClick={() => setViewerEnabled((v) => !v)}>
                    {viewerEnabled ? "Pause Preview" : "Load Preview"}
                  </Button>
                )}
                {viewerHref && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={viewerHref} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="px-4 py-2 border-b text-xs text-muted-foreground flex items-center justify-between">
              <span>{selectedPage ? `Page ${selectedPage}` : "No page selected"}</span>
              <span>{selectedDocumentPages ? `${selectedPage || 1}/${selectedDocumentPages}` : "--/--"}</span>
            </div>
            <div className="flex-1 bg-muted/60 min-h-[320px]">
              {viewerHref && viewerEnabled ? (
                <iframe key={viewerKey} title="Source document viewer" src={viewerHref} className="w-full h-full border-0" />
              ) : viewerHref ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <div className="w-[92%] h-[88%] rounded-md border border-dashed border-border/70 bg-background/70 flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-2" /> Preview paused. Click Load Preview.
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <div className="w-[92%] h-[88%] rounded-md border border-dashed border-border/70 bg-background/70 flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-2" /> Select an event to jump to source citation.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activePanel === "vault" && (
        <div className="mx-6 mt-3 mb-6 border rounded-lg bg-card flex flex-col overflow-hidden min-h-[500px]">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold">Evidence Vault</div>
            <div className="flex items-center gap-2">
              {latestRun && (
                <Button size="sm" variant="outline" onClick={() => {
                  setViewerMode("chronology");
                  setViewerEnabled(true);
                  setViewerKey((k) => k + 1);
                }}>
                  Chronology PDF
                </Button>
              )}
              {viewerHref && (
                <Button size="sm" onClick={() => setViewerEnabled((v) => !v)}>
                  {viewerEnabled ? "Pause Preview" : "Load Preview"}
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 bg-muted/60 min-h-[320px]">
            {viewerHref && viewerEnabled ? (
              <iframe key={viewerKey} title="Evidence vault viewer" src={viewerHref} className="w-full h-full border-0" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                <div className="w-[92%] h-[88%] rounded-md border border-dashed border-border/70 bg-background/70 flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" /> Preview paused. Click Load Preview.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className={`mx-6 mb-6 border rounded-lg bg-card overflow-hidden ${dockCollapsed ? "h-12" : "h-[300px]"}`}>
          <div className="h-12 px-4 border-b flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Context Dock
            </div>
            <Button size="sm" variant="ghost" onClick={() => setDockCollapsed((v) => !v)}>
              {dockCollapsed ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
            </Button>
          </div>
          {!dockCollapsed && (
            <Tabs defaultValue="claim" className="h-[calc(100%-48px)]">
              <TabsList className="mx-4 mt-2 grid grid-cols-5">
                <TabsTrigger value="claim">Claim ({commandCenter.claimRows.length})</TabsTrigger>
                <TabsTrigger value="causation">Causation ({commandCenter.causationChains.length})</TabsTrigger>
                <TabsTrigger value="contradictions">Contradictions ({commandCenter.contradictionMatrix.length})</TabsTrigger>
                <TabsTrigger value="defense">Defense ({commandCenter.defenseAttackPaths.length})</TabsTrigger>
                <TabsTrigger value="collapse">Collapse ({commandCenter.collapseCandidates.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="claim" className="h-[calc(100%-48px)] p-3 overflow-y-auto text-xs space-y-2">
                {commandCenter.claimRows.length === 0 && <div className="text-muted-foreground">No claim candidates yet.</div>}
                {commandCenter.claimRows.slice(0, 12).map((row, idx) => {
                  const citationIds = collectCitationIds(row);
                  return (
                    <div key={`dock-claim-${idx}`} className="border rounded-md p-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{textFrom(row, ["claim_type"], "Claim")}</div>
                        <div className="text-muted-foreground">{textFrom(row, ["assertion", "summary"], "No details.")}</div>
                      </div>
                      {citationIds[0] && <Button size="sm" variant="outline" onClick={() => focusCitation(citationIds[0])}>Source</Button>}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="causation" className="h-[calc(100%-48px)] p-3 overflow-y-auto text-xs space-y-2">
                {commandCenter.causationChains.length === 0 && <div className="text-muted-foreground">No causation signals for this selection.</div>}
                {commandCenter.causationChains.map((row, idx) => (
                  <div key={`dock-causation-${idx}`} className="border rounded-md p-2">
                    <div className="font-medium">{textFrom(row, ["body_region"], "General")}</div>
                    <div className="text-muted-foreground">{textFrom(row, ["causation_thesis", "summary"], "No details.")}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="contradictions" className="h-[calc(100%-48px)] p-3 overflow-y-auto text-xs space-y-2">
                {commandCenter.contradictionMatrix.length === 0 && <div className="text-muted-foreground">No contradictions detected.</div>}
                {commandCenter.contradictionMatrix.map((row, idx) => (
                  <div key={`dock-contradiction-${idx}`} className="border rounded-md p-2">
                    <div className="font-medium">{textFrom(row, ["category", "contradiction_type"], "Contradiction")}</div>
                    <div className="text-muted-foreground">{textFrom(row, ["description", "analysis"], "No details.")}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="defense" className="h-[calc(100%-48px)] p-3 overflow-y-auto text-xs space-y-2">
                {(commandCenter.defenseAttackPaths.length + commandCenter.objectionProfiles.length) === 0 && <div className="text-muted-foreground">No defense signals available.</div>}
                {commandCenter.defenseAttackPaths.map((row, idx) => (
                  <div key={`dock-defense-${idx}`} className="border rounded-md p-2">
                    <div className="font-medium">{textFrom(row, ["attack", "attack_vector", "title"], "Defense Path")}</div>
                    <div className="text-muted-foreground">{textFrom(row, ["path", "description", "summary"], "No details.")}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="collapse" className="h-[calc(100%-48px)] p-3 overflow-y-auto text-xs space-y-2">
                {commandCenter.collapseCandidates.length === 0 && <div className="text-muted-foreground">No collapse candidates.</div>}
                {commandCenter.collapseCandidates.map((row, idx) => (
                  <div key={`dock-collapse-${idx}`} className="border rounded-md p-2">
                    <div className="font-medium">{textFrom(row, ["fragility_type", "title"], "Fragility")}</div>
                    <div className="text-muted-foreground">{textFrom(row, ["why", "argument", "summary"], "No details.")}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}
