import type {
  CaseWorkspacePayload,
  CitationRef,
  VisitRow,
  ProviderRoleRow,
  DiagnosisRow,
  InjuryClusterRow,
  InjuryClusterSeverityRow,
  EscalationStep,
  CausationTimeline,
  DefenseAttackMap,
  SettlementLeverageModel,
  SettlementModelReport,
  CaseSeverityIndex,
  RawEvent,
} from "./workspace-types";

function safeArray<T>(val: unknown): T[] {
  if (!Array.isArray(val)) return [];
  return val as T[];
}

function safeObj<T extends Record<string, unknown>>(val: unknown): T {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as T;
  return {} as T;
}

export function adaptEvidenceGraphToWorkspace(
  raw: unknown,
  opts: { caseId: string; matterTitle: string; runId: string; lastRunAt?: string }
): CaseWorkspacePayload {
  const graph = safeObj<Record<string, unknown>>(raw);
  const inner = graph.evidence_graph
    ? safeObj<Record<string, unknown>>(graph.evidence_graph)
    : graph;
  const ext = safeObj<Record<string, unknown>>(
    (inner.extensions as unknown) ?? (graph.extensions as unknown)
  );

  // Build citation map
  const rawCitations = safeArray<Record<string, unknown>>(
    (inner.citations as unknown) ?? (graph.citations as unknown)
  );
  const citations = new Map<string, CitationRef>();
  for (const c of rawCitations) {
    const id = String(c.citation_id ?? "");
    if (id) {
      citations.set(id, {
        citation_id: id,
        source_document_id: String(c.source_document_id ?? ""),
        page_number: Number(c.page_number ?? 0),
        snippet: c.snippet ? String(c.snippet) : undefined,
      });
    }
  }

  // Registries
  const visits = safeArray<VisitRow>(ext.visit_abstraction_registry as unknown);
  const providers = safeArray<ProviderRoleRow>(ext.provider_role_registry as unknown);
  const diagnoses = safeArray<DiagnosisRow>(ext.diagnosis_registry as unknown);
  const clusters = safeArray<InjuryClusterRow>(ext.injury_clusters as unknown);
  const clusterSeverity = safeArray<InjuryClusterSeverityRow>(ext.injury_cluster_severity as unknown);
  const escalationPath = safeArray<EscalationStep>(ext.treatment_escalation_path as unknown);

  const causationRaw = safeObj<Record<string, unknown>>(ext.causation_timeline_registry as unknown);
  const causationTimeline: CausationTimeline = {
    rungs: safeArray(causationRaw.rungs as unknown),
    missing_rungs: safeArray(causationRaw.missing_rungs as unknown),
  };

  // Defense attack map
  const damRaw = safeObj<Record<string, unknown>>(ext.defense_attack_map as unknown);
  const defenseAttackMap: DefenseAttackMap = {
    version: String(damRaw.version ?? "dam.v1"),
    flags: safeArray(damRaw.flags as unknown),
  };

  // Settlement intelligence
  const slmRaw = safeObj<Record<string, unknown>>(ext.settlement_leverage_model as unknown);
  const smrRaw = safeObj<Record<string, unknown>>(ext.settlement_model_report as unknown);
  const csiRaw = safeObj<Record<string, unknown>>(ext.case_severity_index as unknown);

  const settlement = {
    leverage: Object.keys(slmRaw).length
      ? (slmRaw as unknown as SettlementLeverageModel)
      : null,
    report: Object.keys(smrRaw).length
      ? (smrRaw as unknown as SettlementModelReport)
      : null,
    severity: Object.keys(csiRaw).length
      ? (csiRaw as unknown as CaseSeverityIndex)
      : null,
  };

  // Visit bucket quality
  const vbqRaw = safeObj<Record<string, unknown>>(ext.visit_bucket_quality as unknown);
  const totalEncounters = Number(vbqRaw.total_encounters ?? 0);
  const encountersMissing = Number(vbqRaw.encounters_with_missing_required_buckets ?? 0);
  const fillRate = totalEncounters > 0 ? 1 - encountersMissing / totalEncounters : 1;

  // Raw events for timeline
  const rawEvents = safeArray<Record<string, unknown>>(
    (inner.events as unknown) ?? (graph.events as unknown)
  );
  const events: RawEvent[] = rawEvents.map((e, idx) => {
    const dateObj = safeObj<Record<string, unknown>>(e.date as unknown);
    const dateLabel = String(dateObj.normalized ?? dateObj.original_text ?? "Undated");
    const eventType = String(e.event_type ?? "Encounter")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const facts = safeArray<Record<string, unknown>>(e.facts as unknown);
    const summary =
      facts
        .map((f) => String(f.text ?? ""))
        .filter(Boolean)
        .join(" ") || "No summary available.";

    const allCitIds = new Set<string>();
    for (const id of safeArray<unknown>(e.citation_ids as unknown))
      allCitIds.add(String(id));
    for (const fact of facts) {
      if (fact.citation_id) allCitIds.add(String(fact.citation_id));
      for (const id of safeArray<unknown>(fact.citation_ids as unknown))
        allCitIds.add(String(id));
    }
    const citationRefs = Array.from(allCitIds)
      .map((id) => citations.get(id))
      .filter((c): c is CitationRef => !!c);

    const provId = String(e.provider_id ?? "");
    const provRow = providers.find((p) => p.provider_id === provId);
    const providerName = provRow?.provider_name ?? "Unknown Provider";

    return {
      event_id: String(e.event_id ?? `e-${idx}`),
      date: dateLabel !== "Undated" ? dateLabel : null,
      dateLabel,
      eventType,
      providerName,
      summary,
      confidence: Number(e.confidence ?? 0),
      citationRefs,
    };
  });

  // Build reverse page index: page_number → CitationRef[]
  const pageIndex = new Map<number, CitationRef[]>();
  for (const ref of citations.values()) {
    if (ref.page_number > 0) {
      const existing = pageIndex.get(ref.page_number) ?? [];
      existing.push(ref);
      pageIndex.set(ref.page_number, existing);
    }
  }

  return {
    caseId: opts.caseId,
    matterTitle: opts.matterTitle,
    runId: opts.runId,
    lastRunAt: opts.lastRunAt,
    citations,
    pageIndex,
    visits,
    providers,
    diagnoses,
    clusters,
    clusterSeverity,
    escalationPath,
    causationTimeline,
    defenseAttackMap,
    settlement,
    health: {
      bucketFillRate: fillRate,
      encountersMissingBuckets: encountersMissing,
      treatmentGaps: 0,
      totalEvents: rawEvents.length,
    },
    events,
  };
}
