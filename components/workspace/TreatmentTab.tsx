"use client";

import { useMemo } from "react";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TreatmentTabProps {
  payload: CaseWorkspacePayload;
}

const STAGE_LABELS: Record<string, string> = {
  er: "ER",
  primary_care: "Primary Care",
  imaging: "Imaging",
  specialist: "Specialist",
  surgery: "Surgery",
  therapy: "PT",
  follow_up: "Follow-Up",
};

const STAGE_COLORS: Record<string, string> = {
  er: "bg-red-500",
  imaging: "bg-blue-500",
  specialist: "bg-purple-500",
  surgery: "bg-orange-500",
  therapy: "bg-green-500",
  primary_care: "bg-cyan-500",
  follow_up: "bg-slate-500",
};

export function TreatmentTab({ payload }: TreatmentTabProps) {
  const { visits, escalationPath, citations } = payload;

  // Build monthly density data for chart
  const densityData = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const v of visits) {
      if (!v.date) continue;
      const month = v.date.slice(0, 7); // YYYY-MM
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, visits: count }));
  }, [visits]);

  // Calculate specials from visit bucket text (treatments + procedures)
  const treatmentSummary = useMemo(() => {
    const typeCount = new Map<string, number>();
    for (const v of visits) {
      typeCount.set(v.encounter_type, (typeCount.get(v.encounter_type) ?? 0) + 1);
    }
    return typeCount;
  }, [visits]);

  const totalVisits = visits.length;
  const ptVisits = treatmentSummary.get("therapy") ?? 0;
  const surgeryVisits = treatmentSummary.get("surgery") ?? 0;
  const imagingVisits = treatmentSummary.get("imaging") ?? 0;

  // Billing data from extensions (if present — may be empty for many cases)
  const billingLines = (payload as unknown as Record<string, unknown>).billing_lines as Array<Record<string, unknown>> | undefined;
  const billingSummary = (payload as unknown as Record<string, unknown>).billing_summary as Record<string, unknown> | undefined;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Treatment intensity */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 border-r border-border-dark space-y-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Visit Density Over Time</h3>
          {densityData.length > 0 ? (
            <div className="h-40 bg-surface-dark/30 rounded-xl border border-border-dark p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={densityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ background: "#1a1f29", border: "1px solid #30363d", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: "bold" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center border border-border-dark rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest">
              No dated visits available
            </div>
          )}
        </div>

        {/* Treatment summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Visits", value: totalVisits },
            { label: "PT Sessions", value: ptVisits },
            { label: "Imaging Studies", value: imagingVisits },
            { label: "Surgeries", value: surgeryVisits },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-dark/40 border border-border-dark rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-mono font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Escalation ladder */}
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Escalation Path</h3>
          <div className="flex items-center gap-1 flex-wrap">
            {escalationPath.map((step, idx) => (
              <div key={step.stage} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide text-white ${STAGE_COLORS[step.stage] ?? "bg-slate-700"}`}>
                  <span>{STAGE_LABELS[step.stage] ?? step.stage}</span>
                  {step.citation_ids.slice(0, 1).map((cid) => {
                    const c = citations.get(cid);
                    return c ? <CitationChip key={cid} citation={c} claimText={`${STAGE_LABELS[step.stage]} on ${step.date}`} /> : null;
                  })}
                </div>
                {idx < escalationPath.length - 1 && (
                  <span className="text-slate-600 text-sm">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Specials / Billing */}
      <div className="w-80 shrink-0 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specials / Billing</h3>

        {billingSummary ? (
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-4 space-y-2">
            {Boolean(billingSummary.is_partial) && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-3 py-2 text-[10px] font-bold text-yellow-300">
                ⚠ Billing data is partial
              </div>
            )}
            {billingSummary.total_extracted_charges != null && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total extracted</span>
                <span className="text-sm font-black text-white font-mono">
                  ${Number(billingSummary.total_extracted_charges).toLocaleString()}
                </span>
              </div>
            )}
            {billingSummary.completeness_note != null && (
              <p className="text-[10px] text-slate-500">{String(billingSummary.completeness_note)}</p>
            )}
          </div>
        ) : (
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Billing data not extracted
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Specials will appear here once billing records are processed.
            </p>
          </div>
        )}

        {billingLines && billingLines.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Billing Lines</p>
            <div className="space-y-2">
              {billingLines.slice(0, 20).map((line, i) => (
                <div key={i} className="bg-surface-dark/30 border border-border-dark rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-slate-300 truncate">{String(line.description ?? "Service")}</p>
                    {line.amount != null && (
                      <span className="font-mono font-black text-white shrink-0">${Number(line.amount).toLocaleString()}</span>
                    )}
                  </div>
                  {line.date != null && <p className="text-slate-600 font-mono mt-0.5 text-[10px]">{String(line.date)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visit type breakdown */}
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">By Encounter Type</p>
          <div className="space-y-2">
            {Array.from(treatmentSummary.entries()).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STAGE_COLORS[type] ?? "bg-slate-500"}`} />
                <span className="text-xs text-slate-400 flex-1">{STAGE_LABELS[type] ?? type}</span>
                <span className="text-xs font-mono font-black text-slate-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
