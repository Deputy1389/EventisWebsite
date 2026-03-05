"use client";

import { useMemo, useRef } from "react";
import { Printer, AlertTriangle } from "lucide-react";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";

interface MediationPacketTabProps {
  payload: CaseWorkspacePayload;
}

export function MediationPacketTab({ payload }: MediationPacketTabProps) {
  const { matterTitle, clusters, clusterSeverity, causationTimeline, settlement, escalationPath, diagnoses, citations, health } = payload;
  const printRef = useRef<HTMLDivElement>(null);

  // Build severity-sorted cluster list
  const rankedClusters = useMemo(() => {
    const sevMap = new Map(clusterSeverity.map((s) => [s.cluster_name, s]));
    return clusters
      .map((c) => ({ ...c, severity: sevMap.get(c.cluster_name) ?? null }))
      .sort((a, b) => (b.severity?.severity_score_0_100 ?? 0) - (a.severity?.severity_score_0_100 ?? 0));
  }, [clusters, clusterSeverity]);

  const presentRungs = causationTimeline.rungs.filter((r) => r.status === "present");
  const missingRungs = causationTimeline.missing_rungs;
  const sli = settlement.leverage?.settlement_leverage_index;
  const sliPct = sli != null ? Math.round(Number(sli) * 100) : null;

  function handlePrint() {
    window.print();
  }

  const isEmpty = rankedClusters.length === 0 && presentRungs.length === 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 h-10 border-b border-border-dark flex items-center justify-between px-4 bg-background-dark">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mediation Packet</p>
        <button
          onClick={handlePrint}
          disabled={isEmpty}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500/50" />
          <p className="text-slate-400 text-sm font-bold">Insufficient data for mediation packet</p>
          <p className="text-slate-600 text-xs max-w-xs">
            Run the pipeline on a complete medical records packet to populate injury clusters and
            causation data.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Print-ready packet content */}
          <div
            ref={printRef}
            className="max-w-3xl mx-auto p-8 space-y-8 print:p-0 print:space-y-6"
            id="mediation-packet"
          >
            {/* Header */}
            <div className="border-b border-border-dark pb-6 print:border-slate-300">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 print:text-gray-500">
                Mediation Leverage Brief — Confidential
              </p>
              <h1 className="text-2xl font-black text-white print:text-black">{matterTitle}</h1>
              {health.totalEvents > 0 && (
                <p className="text-xs text-slate-500 mt-1 print:text-gray-500">
                  {health.totalEvents} medical events · {health.treatmentGaps} treatment gaps · {Math.round(health.bucketFillRate * 100)}% record completeness
                </p>
              )}
            </div>

            {/* Section 1: Injury Summary */}
            {rankedClusters.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 print:text-gray-500">
                  1. Medical Severity Profile
                </h2>
                <div className="space-y-3">
                  {rankedClusters.map((cluster) => {
                    const sev = cluster.severity;
                    return (
                      <div
                        key={cluster.cluster_name}
                        className="border border-border-dark rounded-xl p-4 print:border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-white print:text-black">
                                {cluster.cluster_name}
                              </p>
                              <ClassBadge classification={cluster.classification} />
                            </div>
                            {cluster.diagnosis_labels.length > 0 && (
                              <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
                                {cluster.diagnosis_labels.slice(0, 4).join(" · ")}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {sev?.surgery_present && <EvidencePill label="Surgery" />}
                              {sev?.mri_pathology_present && <EvidencePill label="MRI Pathology" />}
                              {sev?.injection_present && <EvidencePill label="Injection" />}
                              {sev?.specialist_involvement && <EvidencePill label="Specialist" />}
                            </div>
                          </div>
                          {sev && (
                            <div className="shrink-0 text-right">
                              <p className="text-2xl font-black font-mono text-white print:text-black">
                                {sev.severity_score_0_100}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest print:text-gray-500">
                                Severity
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Supporting citations */}
                        {sev && sev.citation_ids.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-3 print:hidden">
                            {sev.citation_ids.slice(0, 5).map((cid) => {
                              const c = citations.get(cid);
                              return c ? (
                                <CitationChip key={cid} citation={c} claimText={cluster.cluster_name} />
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 2: Causation Chain */}
            {(presentRungs.length > 0 || missingRungs.length > 0) && (
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 print:text-gray-500">
                  2. Causation Foundation
                </h2>
                <div className="space-y-2">
                  {presentRungs.map((rung) => (
                    <div
                      key={rung.rung}
                      className="flex items-start gap-3 p-3 border border-emerald-500/20 rounded-lg bg-emerald-900/10 print:border-green-200 print:bg-green-50"
                    >
                      <span className="text-emerald-400 font-black text-sm shrink-0 print:text-green-700">✓</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white print:text-black">{rung.label}</p>
                        {rung.date && (
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 print:text-gray-500">{rung.date}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap print:hidden">
                        {rung.citation_ids.slice(0, 3).map((cid) => {
                          const c = citations.get(cid);
                          return c ? <CitationChip key={cid} citation={c} claimText={rung.label} /> : null;
                        })}
                      </div>
                    </div>
                  ))}
                  {missingRungs.map((rung) => (
                    <div
                      key={rung.rung}
                      className="flex items-start gap-3 p-3 border border-orange-500/20 rounded-lg bg-orange-900/10 print:border-orange-200 print:bg-orange-50"
                    >
                      <span className="text-orange-400 font-black text-sm shrink-0 print:text-orange-700">⚠</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 print:text-gray-600">{rung.label}</p>
                        {rung.missing_reason && (
                          <p className="text-[10px] text-slate-600 mt-0.5 print:text-gray-500">{rung.missing_reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Treatment Escalation */}
            {escalationPath.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 print:text-gray-500">
                  3. Treatment Escalation
                </h2>
                <div className="flex items-center gap-1 flex-wrap">
                  {escalationPath.map((step, idx) => (
                    <div key={step.stage} className="flex items-center gap-1">
                      <div className="px-3 py-1.5 rounded-lg bg-surface-dark/60 border border-border-dark text-[10px] font-black uppercase tracking-wide text-slate-300 print:border-gray-300 print:text-gray-700">
                        {step.stage.replace(/_/g, " ")}
                        {step.date && <span className="text-slate-500 ml-1.5 font-mono print:text-gray-500">{step.date}</span>}
                      </div>
                      {idx < escalationPath.length - 1 && (
                        <span className="text-slate-600 print:text-gray-400">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 4: Diagnoses */}
            {diagnoses.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 print:text-gray-500">
                  4. Diagnoses of Record
                </h2>
                <div className="overflow-hidden border border-border-dark rounded-xl print:border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border-dark bg-surface-dark/30 print:border-gray-200 print:bg-gray-50">
                        <th className="text-left px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-gray-500">Diagnosis</th>
                        <th className="text-left px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-gray-500">First Seen</th>
                        <th className="text-left px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-gray-500">Provider</th>
                        <th className="px-3 py-2 print:hidden" />
                      </tr>
                    </thead>
                    <tbody>
                      {diagnoses.slice(0, 20).map((d, i) => (
                        <tr key={i} className="border-b border-border-dark last:border-0 print:border-gray-100">
                          <td className="px-3 py-2 text-slate-200 print:text-black">{d.diagnosis_label}</td>
                          <td className="px-3 py-2 text-slate-400 font-mono print:text-gray-600">{d.first_seen_date ?? "—"}</td>
                          <td className="px-3 py-2 text-slate-400 print:text-gray-600 truncate max-w-[140px]">{d.provider}</td>
                          <td className="px-3 py-2 print:hidden">
                            <div className="flex gap-1 flex-wrap justify-end">
                              {d.citation_ids.slice(0, 2).map((cid) => {
                                const c = citations.get(cid);
                                return c ? <CitationChip key={cid} citation={c} claimText={d.diagnosis_label} /> : null;
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 5: Settlement Posture */}
            {(settlement.report || settlement.leverage) && (
              <section>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 print:text-gray-500">
                  5. Settlement Posture
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {sliPct != null && (
                    <div className="border border-border-dark rounded-xl p-4 text-center print:border-gray-200">
                      <p className="text-3xl font-black font-mono text-white print:text-black">{sliPct}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 print:text-gray-500">Settlement Leverage Index</p>
                      {settlement.leverage?.posture && (
                        <p className="text-[10px] text-slate-400 mt-2 print:text-gray-600">{settlement.leverage.posture}</p>
                      )}
                    </div>
                  )}
                  {settlement.report && (
                    <div className="space-y-3">
                      {settlement.report.strengths.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 print:text-green-700">Strengths</p>
                          <ul className="space-y-1">
                            {settlement.report.strengths.slice(0, 4).map((s, i) => (
                              <li key={i} className="text-[10px] text-slate-300 print:text-gray-700">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {settlement.report.risk_factors.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 print:text-red-700">Risk Factors</p>
                          <ul className="space-y-1">
                            {settlement.report.risk_factors.slice(0, 3).map((r, i) => (
                              <li key={i} className="text-[10px] text-slate-400 print:text-gray-600">• {r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Print footer */}
            <div className="border-t border-border-dark pt-4 hidden print:block print:border-gray-200">
              <p className="text-[9px] text-gray-400 text-center">
                Generated by LineCite — Confidential Attorney Work Product — {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Print CSS injected inline */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #mediation-packet, #mediation-packet * { visibility: visible; }
          #mediation-packet { position: fixed; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function ClassBadge({ classification }: { classification: string }) {
  const styles: Record<string, string> = {
    primary: "bg-red-900/30 text-red-300 border-red-500/30",
    secondary: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
    preexisting: "bg-slate-800 text-slate-400 border-slate-600",
  };
  return (
    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${styles[classification] ?? styles.primary}`}>
      {classification}
    </span>
  );
}

function EvidencePill({ label }: { label: string }) {
  return (
    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 print:hidden">
      {label}
    </span>
  );
}
