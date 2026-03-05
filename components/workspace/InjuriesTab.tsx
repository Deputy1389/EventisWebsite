"use client";

import { useState } from "react";
import { useEvidenceTrace } from "@/lib/workspace-context";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload, InjuryClusterRow, InjuryClusterSeverityRow } from "@/lib/workspace-types";
import { toast } from "sonner";

interface InjuriesTabProps {
  payload: CaseWorkspacePayload;
}

const CLASSIFICATION_STYLES: Record<string, string> = {
  primary: "bg-red-900/30 text-red-300 border-red-700/40",
  secondary: "bg-blue-900/30 text-blue-300 border-blue-700/40",
  preexisting: "bg-yellow-900/30 text-yellow-300 border-yellow-700/40",
};

export function InjuriesTab({ payload }: InjuriesTabProps) {
  const { setTrace } = useEvidenceTrace();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  const { clusters, clusterSeverity, diagnoses, citations } = payload;

  function getSeverity(clusterName: string): InjuryClusterSeverityRow | undefined {
    return clusterSeverity.find((s) => s.cluster_name === clusterName);
  }

  function getClusterDiagnoses(cluster: InjuryClusterRow) {
    return diagnoses.filter((d) => d.cluster_name === cluster.cluster_name);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Injury cluster cards */}
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Injury Clusters</h3>
          {clusters.length === 0 ? (
            <EmptyState message="No injury clusters detected" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {clusters.map((cluster) => {
                const sev = getSeverity(cluster.cluster_name);
                const isSelected = selectedCluster === cluster.cluster_name;
                const sevPct = sev?.severity_score_0_100 ?? 0;
                const sevColor = sevPct >= 70 ? "bg-red-500" : sevPct >= 40 ? "bg-yellow-500" : "bg-emerald-500";

                return (
                  <div
                    key={cluster.cluster_name}
                    onClick={() => setSelectedCluster(isSelected ? null : cluster.cluster_name)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border-dark bg-surface-dark/40 hover:border-slate-600"}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        {cluster.cluster_name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${CLASSIFICATION_STYLES[cluster.classification] ?? CLASSIFICATION_STYLES.primary}`}>
                        {cluster.classification}
                      </span>
                    </div>

                    {/* Severity bar */}
                    {sev && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Severity</span>
                          <span className="text-[10px] font-mono font-black text-slate-300">{sevPct}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${sevColor} rounded-full transition-all`} style={{ width: `${sevPct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Feature pills */}
                    {sev && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sev.surgery_present && <Pill label="Surgery" color="text-orange-300 bg-orange-900/30 border-orange-700/30" />}
                        {sev.injection_present && <Pill label="Injection" color="text-blue-300 bg-blue-900/30 border-blue-700/30" />}
                        {sev.mri_pathology_present && <Pill label="MRI+" color="text-purple-300 bg-purple-900/30 border-purple-700/30" />}
                        {sev.specialist_involvement && <Pill label="Specialist" color="text-cyan-300 bg-cyan-900/30 border-cyan-700/30" />}
                        {sev.pt_visit_count > 0 && <Pill label={`PT ×${sev.pt_visit_count}`} color="text-green-300 bg-green-900/30 border-green-700/30" />}
                      </div>
                    )}

                    {/* Citations */}
                    {cluster.diagnosis_refs.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {cluster.diagnosis_refs.slice(0, 4).map((cid) => {
                          const c = citations.get(cid);
                          return c ? (
                            <CitationChip
                              key={cid}
                              citation={c}
                              claimText={cluster.cluster_name.replace(/_/g, " ")}
                            />
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Diagnosis registry table */}
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Diagnosis Registry</h3>
          {diagnoses.length === 0 ? (
            <EmptyState message="No diagnoses extracted" />
          ) : (
            <div className="border border-border-dark rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-dark border-b border-border-dark">
                  <tr>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Diagnosis</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-24">First Seen</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-36">Provider</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-20">Class</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-28">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((d, idx) => {
                    const highlight = selectedCluster && d.cluster_name === selectedCluster;
                    return (
                      <tr
                        key={`${d.diagnosis_label}-${idx}`}
                        className={`border-b border-border-dark/50 transition-colors ${highlight ? "bg-primary/5" : "hover:bg-surface-dark/40"}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs text-slate-200 font-medium leading-snug">{d.diagnosis_label}</p>
                          {d.icd_codes.length > 0 && (
                            <p className="text-[10px] font-mono text-slate-600 mt-0.5">{d.icd_codes.join(", ")}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-mono text-slate-400">{d.first_seen_date ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[144px]">{d.provider}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${CLASSIFICATION_STYLES[d.classification] ?? CLASSIFICATION_STYLES.primary}`}>
                            {d.classification}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {d.citation_ids.slice(0, 3).map((cid) => {
                              const c = citations.get(cid);
                              return c ? (
                                <CitationChip
                                  key={cid}
                                  citation={c}
                                  claimText={d.diagnosis_label}
                                />
                              ) : null;
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Build demand narrative stub */}
        <div className="flex justify-end">
          <button
            onClick={() => toast.info("Demand narrative builder coming in the next release.")}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-border-dark text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            Build Demand Narrative →
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${color}`}>{label}</span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-slate-600 text-xs font-bold uppercase tracking-widest border border-border-dark rounded-xl">
      {message}
    </div>
  );
}
