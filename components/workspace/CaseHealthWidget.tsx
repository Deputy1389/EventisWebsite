"use client";

import type { CaseWorkspacePayload } from "@/lib/workspace-types";

interface CaseHealthWidgetProps {
  health: CaseWorkspacePayload["health"];
  lastRunAt?: string;
}

export function CaseHealthWidget({ health, lastRunAt }: CaseHealthWidgetProps) {
  const fillPct = Math.round(health.bucketFillRate * 100);
  const fillColor = fillPct >= 80 ? "text-emerald-400" : fillPct >= 60 ? "text-yellow-400" : "text-red-400";
  const fillBarColor = fillPct >= 80 ? "bg-emerald-500" : fillPct >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="p-3 border-t border-border-dark mt-auto space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Case Health</p>

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

      {lastRunAt && (
        <p className="text-[9px] font-mono text-slate-600 truncate">
          Run: {new Date(lastRunAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function HealthRow({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-black font-mono ${warn && value > 0 ? "text-yellow-400" : "text-slate-300"}`}>
        {value}
      </span>
    </div>
  );
}
