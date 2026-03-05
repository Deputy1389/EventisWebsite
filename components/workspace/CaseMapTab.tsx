"use client";

import { useState, useMemo } from "react";
import { useEvidenceTrace } from "@/lib/workspace-context";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload, EscalationStep, CausationRung } from "@/lib/workspace-types";
import { AlertTriangle, CheckCircle, XCircle, Play, Shield, Link } from "lucide-react";

interface CaseMapTabProps {
  payload: CaseWorkspacePayload;
}

const STAGE_LABELS: Record<string, string> = {
  er: "Emergency Room",
  primary_care: "Primary Care",
  imaging: "Imaging / Radiology",
  specialist: "Specialist",
  surgery: "Surgery / Procedure",
  therapy: "Physical Therapy",
  follow_up: "Follow-Up",
};

const STAGE_COLORS: Record<string, { border: string; bg: string; dot: string }> = {
  er: { border: "border-red-500/60", bg: "bg-red-900/10", dot: "bg-red-500" },
  imaging: { border: "border-blue-500/60", bg: "bg-blue-900/10", dot: "bg-blue-500" },
  specialist: { border: "border-purple-500/60", bg: "bg-purple-900/10", dot: "bg-purple-500" },
  surgery: { border: "border-orange-500/60", bg: "bg-orange-900/10", dot: "bg-orange-500" },
  therapy: { border: "border-green-500/60", bg: "bg-green-900/10", dot: "bg-green-500" },
  primary_care: { border: "border-cyan-500/60", bg: "bg-cyan-900/10", dot: "bg-cyan-500" },
  follow_up: { border: "border-slate-500/60", bg: "bg-slate-900/10", dot: "bg-slate-500" },
};

type Overlay = "none" | "defense" | "causation";

export function CaseMapTab({ payload }: CaseMapTabProps) {
  const { setTrace } = useEvidenceTrace();
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(-1);

  const { escalationPath, causationTimeline, defenseAttackMap, visits } = payload;

  // Group visits by stage
  const visitsByStage = useMemo(() => {
    const map = new Map<string, typeof visits>();
    for (const v of visits) {
      const stage = v.provider_role;
      if (!map.has(stage)) map.set(stage, []);
      map.get(stage)!.push(v);
    }
    return map;
  }, [visits]);

  // Triggered defense attacks
  const triggeredAttacks = useMemo(
    () => defenseAttackMap.flags.filter((f) => f.triggered),
    [defenseAttackMap]
  );

  function startAnimation() {
    setAnimating(true);
    setAnimStep(0);
    escalationPath.forEach((_, i) => {
      setTimeout(() => {
        setAnimStep(i);
        if (i === escalationPath.length - 1) {
          setTimeout(() => { setAnimating(false); setAnimStep(-1); }, 600);
        }
      }, i * 400);
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="shrink-0 border-b border-border-dark px-6 py-3 flex items-center gap-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">Overlay:</span>
        {(["none", "defense", "causation"] as Overlay[]).map((o) => (
          <button
            key={o}
            onClick={() => setOverlay(overlay === o ? "none" : o)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${overlay === o ? "bg-primary/10 text-primary border-primary/30" : "text-slate-500 border-border-dark hover:text-slate-300"}`}
          >
            {o === "none" ? "None" : o === "defense" ? "⚠ Defense Attacks" : "⛓ Causation Chain"}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={startAnimation}
            disabled={animating}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border border-border-dark text-slate-400 hover:text-white hover:border-slate-500 transition-all disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5" />
            Play Case
          </button>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        <div className="max-w-2xl mx-auto relative">
          {/* Incident node */}
          <IncidentNode doi={payload.doi} />

          {/* Escalation path */}
          <div className="space-y-0">
            {escalationPath.map((step, idx) => {
              const colors = STAGE_COLORS[step.stage] ?? STAGE_COLORS.follow_up;
              const stageVisits = visitsByStage.get(step.stage) ?? [];
              const isAnimHighlight = animating && animStep === idx;

              // Defense attacks for this stage
              const defenseHits = overlay === "defense"
                ? triggeredAttacks.filter((a) => {
                    const name = a.flag.toLowerCase();
                    if (step.stage === "er" && name.includes("gap")) return true;
                    if (step.stage === "imaging" && name.includes("imaging")) return true;
                    if (step.stage === "therapy" && name.includes("conservative")) return true;
                    return false;
                  })
                : [];

              // Causation rung for this stage
              const causationRung: CausationRung | undefined = overlay === "causation"
                ? causationTimeline.rungs.find((r) => {
                    if (step.stage === "imaging" && r.rung === "imaging_confirmation") return true;
                    if (step.stage === "specialist" && r.rung === "specialist_confirmation") return true;
                    if (step.stage === "surgery" && r.rung === "surgical_repair_or_high_intensity_equivalent") return true;
                    if (step.stage === "er" && r.rung === "first_treatment") return true;
                    return false;
                  })
                : undefined;

              return (
                <div key={step.stage} className="relative">
                  {/* Connector line */}
                  <div className="absolute left-[23px] top-0 w-px h-6 bg-border-dark" />

                  <div className="pt-6">
                    {/* Stage node */}
                    <div
                      className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-300 ${colors.border} ${colors.bg} ${isAnimHighlight ? "shadow-2xl shadow-primary/20 scale-[1.02]" : "hover:brightness-110"}`}
                      onClick={() => {
                        const c = payload.citations.get(step.citation_ids[0] ?? "");
                        if (c) setTrace({ claimText: `${STAGE_LABELS[step.stage] ?? step.stage} — ${step.provider_name}`, citation: c });
                      }}
                    >
                      {/* Stage dot + label */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${colors.dot}`} />
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">
                          {STAGE_LABELS[step.stage] ?? step.stage}
                        </h3>
                        {step.date && (
                          <span className="ml-auto text-[10px] font-mono text-slate-500">{step.date}</span>
                        )}
                        {step.citation_ids.length > 0 && (
                          <div className="flex gap-1 ml-2">
                            {step.citation_ids.slice(0, 2).map((cid) => {
                              const c = payload.citations.get(cid);
                              return c ? (
                                <CitationChip
                                  key={cid}
                                  citation={c}
                                  claimText={`${STAGE_LABELS[step.stage]} — ${step.provider_name}`}
                                />
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 pl-6">{step.provider_name}</p>

                      {/* Visit count chip */}
                      {stageVisits.length > 0 && (
                        <span className="absolute top-3 right-3 text-[9px] font-black text-slate-500 bg-slate-800 border border-border-dark rounded px-1.5 py-0.5">
                          {stageVisits.length} visit{stageVisits.length !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* Defense overlay */}
                      {defenseHits.map((a) => (
                        <div key={a.flag} className="mt-3 flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-wide">{a.flag.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{a.plaintiff_counter}</p>
                          </div>
                        </div>
                      ))}

                      {/* Causation overlay */}
                      {causationRung && (
                        <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 ${causationRung.status === "present" ? "bg-emerald-900/20 border border-emerald-500/30" : "bg-orange-900/20 border border-orange-500/30"}`}>
                          {causationRung.status === "present"
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                          <p className={`text-[10px] font-black uppercase tracking-wide ${causationRung.status === "present" ? "text-emerald-400" : "text-orange-400"}`}>
                            {causationRung.rung.replace(/_/g, " ")}
                            {causationRung.status === "missing" && " — MISSING"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Injury cluster badges */}
          {payload.clusters.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border-dark">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Injury Clusters</p>
              <div className="flex flex-wrap gap-2">
                {payload.clusters.map((c) => {
                  const sev = payload.clusterSeverity.find((s) => s.cluster_name === c.cluster_name);
                  const classColor = c.classification === "primary" ? "bg-red-900/30 text-red-300 border-red-700/40"
                    : c.classification === "preexisting" ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/40"
                    : "bg-slate-800 text-slate-300 border-slate-700/40";
                  return (
                    <div key={c.cluster_name} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 border text-[11px] font-bold ${classColor}`}>
                      {c.cluster_name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      {sev && <span className="font-mono text-[9px] opacity-70">{sev.severity_score_0_100}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Triggered defense risks summary */}
          {overlay === "defense" && triggeredAttacks.length > 0 && (
            <div className="mt-6 bg-red-900/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-400" />
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{triggeredAttacks.length} Defense Risk{triggeredAttacks.length !== 1 ? "s" : ""} Detected</p>
              </div>
              <div className="space-y-2">
                {triggeredAttacks.map((a) => (
                  <div key={a.flag} className="text-xs">
                    <span className="font-black text-red-300">{a.flag.replace(/_/g, " ")}</span>
                    <span className="text-slate-500"> — </span>
                    <span className="text-slate-400">{a.plaintiff_counter}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing causation rungs summary */}
          {overlay === "causation" && causationTimeline.missing_rungs.length > 0 && (
            <div className="mt-6 bg-orange-900/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-orange-400" />
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{causationTimeline.missing_rungs.length} Causation Gap{causationTimeline.missing_rungs.length !== 1 ? "s" : ""}</p>
              </div>
              {causationTimeline.missing_rungs.map((r) => (
                <div key={r.rung} className="text-xs text-slate-400 mb-1">
                  <span className="font-black text-orange-300">{r.rung.replace(/_/g, " ")}</span>
                  {r.missing_reason && <span className="text-slate-600"> — {r.missing_reason.replace(/_/g, " ")}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncidentNode({ doi }: { doi?: string }) {
  return (
    <div className="flex flex-col items-start mb-0">
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 w-full">
        <div className="w-3 h-3 rounded-full bg-white shrink-0" />
        <div>
          <p className="text-sm font-black text-white uppercase tracking-tight">Incident / Date of Injury</p>
          {doi && <p className="text-[10px] font-mono text-slate-400 mt-0.5">DOI: {doi}</p>}
        </div>
      </div>
      {/* Connector below incident */}
      <div className="w-px h-6 bg-border-dark ml-[23px]" />
    </div>
  );
}
