"use client";

import type { CaseWorkspacePayload } from "@/lib/workspace-types";

interface CaseHealthWidgetProps {
  health: CaseWorkspacePayload["health"];
  lastRunAt?: string;
  exportStatus?: CaseWorkspacePayload["exportStatus"];
  reviewReasons: string[];
}

export function CaseHealthWidget({ health, lastRunAt, exportStatus, reviewReasons }: CaseHealthWidgetProps) {
  const fillPct = Math.round(health.bucketFillRate * 100);
  const fillColor = fillPct >= 80 ? "text-emerald-400" : fillPct >= 60 ? "text-yellow-400" : "text-red-400";
  const fillBarColor = fillPct >= 80 ? "bg-emerald-500" : fillPct >= 60 ? "bg-yellow-500" : "bg-red-500";
  const statusLabel =
    exportStatus === "BLOCKED"
      ? "Action Required"
      : exportStatus === "REVIEW_RECOMMENDED"
      ? "Review Recommended"
      : exportStatus === "VERIFIED"
      ? "Verified"
      : "Unknown";

  return (
    <div className="p-3 border-t border-border-dark mt-auto space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Case Health</p>

      <HealthRow label="Export status" value={statusLabel} warn={exportStatus !== "VERIFIED"} />

      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-400 font-medium">Bucket Fill</span>
          <span className={`text-[10px] font-black font-mono ${fillColor}`}>{fillPct}%</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${fillBarColor} rounded-full transition-all`} style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      <div className="space-y-1.5">
        <HealthRow
          label="Missing buckets"
          value={health.encountersMissingBuckets}
          warn={health.encountersMissingBuckets > 0}
        />
        <HealthRow
          label="Events"
          value={health.totalEvents}
        />
      </div>

      {reviewReasons.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Review Focus</p>
          {reviewReasons.map((reason) => (
            <p key={reason} className="text-[10px] text-slate-300 leading-4">
              {reason}
            </p>
          ))}
        </div>
      )}

      {lastRunAt && (
        <p className="text-[9px] font-mono text-slate-600 truncate">
          Run: {new Date(lastRunAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function HealthRow({ label, value, warn = false }: { label: string; value: number | string; warn?: boolean }) {
  const warnClass =
    warn && (typeof value === "string" ? value.length > 0 : value > 0) ? "text-yellow-400" : "text-slate-300";
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-black font-mono ${warnClass}`}>
        {value}
      </span>
    </div>
  );
}
