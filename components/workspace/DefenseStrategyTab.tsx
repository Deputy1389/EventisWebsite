"use client";

import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload, CausationRung } from "@/lib/workspace-types";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface DefenseStrategyTabProps {
  payload: CaseWorkspacePayload;
}

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-900/30 text-red-300 border-red-500/40",
  MED: "bg-yellow-900/30 text-yellow-300 border-yellow-500/40",
  LOW: "bg-slate-800 text-slate-400 border-slate-600/40",
};

// Heuristic severity from flag name
function attackSeverity(flag: string): "HIGH" | "MED" | "LOW" {
  const HIGH = ["PREEXISTING_CONDITION", "GAP_IN_CARE", "CONSERVATIVE_CARE_ONLY", "DELAYED_TREATMENT"];
  const MED = ["NO_OBJECTIVE_NEURO_DEFICIT", "MINIMAL_IMAGING_FINDINGS", "LOW_PT_COUNT", "SHORT_TREATMENT_DURATION"];
  if (HIGH.includes(flag)) return "HIGH";
  if (MED.includes(flag)) return "MED";
  return "LOW";
}

const RUNG_LABELS: Record<string, string> = {
  incident: "Incident / Mechanism",
  first_treatment: "First Treatment",
  first_diagnosis: "First Diagnosis",
  imaging_confirmation: "Imaging Confirmation",
  specialist_confirmation: "Specialist Confirmation",
  surgical_repair_or_high_intensity_equivalent: "Surgery / High-Intensity Treatment",
};

const HOW_TO_FIX: Record<string, string> = {
  incident: "Document the accident/collision report, police report, or EMS records.",
  first_treatment: "Obtain ER records or first office visit records closest to the date of incident.",
  first_diagnosis: "Obtain treating physician's diagnosis note with explicit injury attribution.",
  imaging_confirmation: "Obtain MRI or imaging study showing objective pathology.",
  specialist_confirmation: "Obtain specialist referral and evaluation report.",
  surgical_repair_or_high_intensity_equivalent: "If surgery occurred, obtain operative report. If not, document physician narrative explaining conservative treatment.",
};

export function DefenseStrategyTab({ payload }: DefenseStrategyTabProps) {
  const { defenseAttackMap, causationTimeline, settlement, citations } = payload;

  const triggeredAttacks = defenseAttackMap.flags
    .filter((f) => f.triggered)
    .sort((a, b) => {
      const order = { HIGH: 0, MED: 1, LOW: 2 };
      return order[attackSeverity(a.flag)] - order[attackSeverity(b.flag)];
    });

  const allAttacks = defenseAttackMap.flags.sort((a, b) => {
    if (a.triggered && !b.triggered) return -1;
    if (!a.triggered && b.triggered) return 1;
    return 0;
  });

  const sli = settlement.leverage?.settlement_leverage_index;
  const sliPct = sli != null ? Math.round(sli * 100) : null;
  const sliColor = sliPct != null ? (sliPct >= 70 ? "text-emerald-400" : sliPct >= 45 ? "text-yellow-400" : "text-red-400") : "text-slate-400";
  const posture = settlement.leverage?.posture ?? settlement.report?.posture_text;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Defense attacks + causation map */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 border-r border-border-dark space-y-6">

        {/* Top defense attacks */}
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
            Defense Risk Vectors
            {triggeredAttacks.length > 0 && (
              <span className="ml-2 text-red-400">({triggeredAttacks.length} triggered)</span>
            )}
          </h3>
          <div className="space-y-3">
            {allAttacks.length === 0 ? (
              <EmptyState message="No defense attack map available" />
            ) : (
              allAttacks.map((attack) => {
                const sev = attackSeverity(attack.flag);
                const isTriggered = attack.triggered;
                return (
                  <div
                    key={attack.flag}
                    className={`border rounded-xl p-4 transition-all ${isTriggered ? "border-red-500/30 bg-red-900/5" : "border-border-dark bg-surface-dark/20 opacity-60"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {isTriggered
                          ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          : <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                        <h4 className="text-xs font-black text-white uppercase tracking-tight">
                          {attack.flag.replace(/_/g, " ")}
                        </h4>
                      </div>
                      {isTriggered && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${SEVERITY_STYLES[sev]}`}>
                          {sev}
                        </span>
                      )}
                    </div>

                    {isTriggered && (
                      <>
                        <div className="pl-6 space-y-2">
                          <div>
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-wide mb-0.5">Defense Argument</p>
                            <p className="text-xs text-slate-400 italic">{attack.defense_argument}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wide mb-0.5">Counter Strategy</p>
                            <p className="text-xs text-slate-300">{attack.plaintiff_counter}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Causation vulnerability map */}
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Causation Chain</h3>
          <div className="space-y-2">
            {causationTimeline.rungs.map((rung) => (
              <CausationRungRow key={rung.rung} rung={rung} citations={citations} />
            ))}
            {causationTimeline.rungs.length === 0 && (
              <EmptyState message="Causation timeline not available" />
            )}
          </div>
        </div>
      </div>

      {/* Right: Settlement posture */}
      <div className="w-72 shrink-0 overflow-y-auto custom-scrollbar p-6 space-y-5">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settlement Posture</h3>

        {/* SLI gauge */}
        {sliPct != null && (
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-4 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Leverage Index</p>
            <p className={`text-5xl font-mono font-black ${sliColor}`}>{sliPct}</p>
            <p className="text-[10px] text-slate-500 mt-1">/ 100</p>
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${sliPct >= 70 ? "bg-emerald-500" : sliPct >= 45 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${sliPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Posture */}
        {posture && (
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Posture</p>
            <p className="text-xs text-slate-300 leading-relaxed">{String(posture)}</p>
          </div>
        )}

        {/* Strengths */}
        {settlement.report?.strengths && settlement.report.strengths.length > 0 && (
          <StrengthRiskList
            title="Strengths"
            items={settlement.report.strengths}
            icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            textColor="text-emerald-300"
          />
        )}

        {/* Risk factors */}
        {settlement.report?.risk_factors && settlement.report.risk_factors.length > 0 && (
          <StrengthRiskList
            title="Risk Factors"
            items={settlement.report.risk_factors}
            icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
            textColor="text-red-300"
          />
        )}

        {/* CSI score */}
        {settlement.severity?.csi_score != null && (
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Case Severity Index</p>
            <p className="text-2xl font-mono font-black text-white">{settlement.severity.csi_score}<span className="text-slate-500 text-sm">/10</span></p>
          </div>
        )}

        {!settlement.leverage && !settlement.report && !settlement.severity && (
          <div className="text-center py-8">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Settlement intelligence not yet available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CausationRungRow({ rung, citations }: { rung: CausationRung; citations: Map<string, import("@/lib/workspace-types").CitationRef> }) {
  const isPresent = rung.status === "present";
  const label = RUNG_LABELS[rung.rung] ?? rung.rung.replace(/_/g, " ");
  const fix = HOW_TO_FIX[rung.rung];

  return (
    <div className={`border rounded-lg p-3 ${isPresent ? "border-emerald-500/20 bg-emerald-900/5" : "border-orange-500/20 bg-orange-900/5"}`}>
      <div className="flex items-center gap-2">
        {isPresent
          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          : <XCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
        <span className={`text-xs font-black uppercase tracking-wide ${isPresent ? "text-emerald-300" : "text-orange-300"}`}>
          {label}
        </span>
        {rung.date && <span className="ml-auto text-[10px] font-mono text-slate-500">{rung.date}</span>}
        {rung.citation_ids.length > 0 && isPresent && (
          <div className="flex gap-1 ml-1">
            {rung.citation_ids.slice(0, 2).map((cid) => {
              const c = citations.get(cid);
              return c ? <CitationChip key={cid} citation={c} claimText={label} /> : null;
            })}
          </div>
        )}
      </div>
      {!isPresent && fix && (
        <p className="text-[10px] text-slate-500 mt-1.5 pl-5 italic">{fix}</p>
      )}
    </div>
  );
}

function StrengthRiskList({ title, items, icon, textColor }: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  textColor: string;
}) {
  return (
    <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`text-[11px] ${textColor} leading-snug`}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-slate-600 text-xs font-bold uppercase tracking-widest border border-border-dark rounded-xl">
      {message}
    </div>
  );
}
