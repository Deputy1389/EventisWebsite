// Pass 054 - Workspace types derived from pass53.v1 registry contract + pass029 intelligence

export type ID = string;

export interface CitationRef {
  citation_id: ID;
  source_document_id: string;
  page_number: number;
  snippet?: string;
}

export type EncounterType =
  | "er"
  | "primary_care"
  | "specialist"
  | "imaging"
  | "therapy"
  | "surgery"
  | "follow_up";

export type ProviderRole =
  | "er"
  | "primary_care"
  | "specialist"
  | "imaging"
  | "therapy"
  | "surgery"
  | "follow_up";

export type Classification = "primary" | "secondary" | "preexisting";

export interface VisitRow {
  event_id: ID;
  date: string | null;
  provider_id: string | null;
  provider_name: string;
  provider_role: ProviderRole;
  encounter_type: EncounterType;
  citation_ids: string[];
  buckets: {
    complaints: string[];
    objective_findings: string[];
    diagnostics: string[];
    diagnoses: string[];
    treatments: string[];
    prescriptions_or_referrals: string[];
    functional_limitations: string[];
    causation_statements: string[];
  };
  missing_required_buckets: string[];
  bucket_completeness_pass: boolean;
}

export interface ProviderRoleRow {
  provider_id: ID;
  provider_name: string;
  provider_role: ProviderRole;
}

export interface DiagnosisRow {
  diagnosis_label: string;
  icd_codes: string[];
  first_seen_date: string | null;
  provider: string;
  provider_id: string | null;
  citation_ids: string[];
  cluster_name: string;
  classification: Classification;
  event_ids: string[];
}

export interface InjuryClusterRow {
  cluster_name: string;
  classification: Classification;
  diagnosis_labels: string[];
  diagnosis_refs: string[];
  event_ids: string[];
}

export interface InjuryClusterSeverityRow {
  cluster_name: string;
  classification: Classification;
  severity_score_0_100: number;
  surgery_present: boolean;
  injection_present: boolean;
  mri_pathology_present: boolean;
  treatment_duration_days: number | null;
  pt_visit_count: number;
  specialist_involvement: boolean;
  treatment_intensity_index: number;
  escalation_level: number;
  citation_ids: string[];
}

export interface EscalationStep {
  stage: ProviderRole;
  date: string | null;
  event_id: string;
  citation_ids: string[];
  provider_name: string;
}

export interface CausationRung {
  rung: string;
  date: string | null;
  label: string;
  citation_ids: string[];
  status: "present" | "missing";
  missing_reason: string | null;
}

export interface CausationTimeline {
  rungs: CausationRung[];
  missing_rungs: CausationRung[];
}

export interface DefenseAttackFlag {
  flag: string;
  triggered: boolean;
  defense_argument: string;
  plaintiff_counter: string;
}

export interface DefenseAttackMap {
  version: string;
  flags: DefenseAttackFlag[];
}

export interface SettlementLeverageModel {
  version: string;
  settlement_leverage_index: number;
  posture: string;
}

export interface SettlementModelReport {
  version: string;
  strengths: string[];
  risk_factors: string[];
  posture_text: string;
}

export interface CaseSeverityIndex {
  version: string;
  csi_score: number;
}

export interface RawEvent {
  event_id: string;
  date: string | null;
  dateLabel: string;
  eventType: string;
  providerName: string;
  summary: string;
  confidence: number;
  citationRefs: CitationRef[];
}

export interface CaseWorkspacePayload {
  caseId: string;
  matterTitle: string;
  runId: string;
  doi?: string;
  lastRunAt?: string;
  visits: VisitRow[];
  providers: ProviderRoleRow[];
  diagnoses: DiagnosisRow[];
  clusters: InjuryClusterRow[];
  clusterSeverity: InjuryClusterSeverityRow[];
  escalationPath: EscalationStep[];
  causationTimeline: CausationTimeline;
  defenseAttackMap: DefenseAttackMap;
  settlement: {
    leverage: SettlementLeverageModel | null;
    report: SettlementModelReport | null;
    severity: CaseSeverityIndex | null;
  };
  health: {
    bucketFillRate: number;
    encountersMissingBuckets: number;
    treatmentGaps: number;
    totalEvents: number;
  };
  events: RawEvent[];
  citations: Map<string, CitationRef>;
  /** Reverse index: page_number → citations on that page (for Evidence Anchor overlay) */
  pageIndex: Map<number, CitationRef[]>;
}

// ── Demand Builder types ──────────────────────────────────────────────────

export type SectionKey = "liability" | "injuries" | "treatment" | "specials" | "demand_amount";
export type DemandTone = "aggressive" | "moderate" | "conservative";

export interface DemandSection {
  text: string;
  citations: string[];  // citation_ids
}

export type DraftSections = Partial<Record<SectionKey, DemandSection>>;

export interface DraftDemand {
  id: string;
  case_id: string;
  run_id: string;
  sections: DraftSections;
  tone: DemandTone;
  created_at: string;
  updated_at: string;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  liability:     "Liability",
  injuries:      "Injuries",
  treatment:     "Treatment",
  specials:      "Specials",
  demand_amount: "Demand Amount",
};
