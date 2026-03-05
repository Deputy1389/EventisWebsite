"use client";

import { useState, useMemo } from "react";
import { useEvidenceTrace } from "@/lib/workspace-context";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload, RawEvent } from "@/lib/workspace-types";
import { Filter, SortAsc } from "lucide-react";

interface TimelineTabProps {
  payload: CaseWorkspacePayload;
}

const ENCOUNTER_LABELS: Record<string, string> = {
  er: "ER",
  imaging: "Imaging",
  specialist: "Specialist",
  therapy: "PT / Therapy",
  surgery: "Surgery",
  primary_care: "Primary Care",
  follow_up: "Follow-Up",
};

const FLAG_STYLES: Record<string, string> = {
  TREATMENT_GAP: "bg-orange-900/40 text-orange-300 border-orange-700/40",
  MISSING_RECORD: "bg-red-900/40 text-red-300 border-red-700/40",
  PREEXISTING: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  LOW_SUPPORT: "bg-slate-800 text-slate-400 border-slate-700/40",
};

export function TimelineTab({ payload }: TimelineTabProps) {
  const { setTrace } = useEvidenceTrace();
  const [filterType, setFilterType] = useState<string>("all");
  const [showDoiCompare, setShowDoiCompare] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const visits = payload.visits;
  const visitMap = useMemo(() => new Map(visits.map((v) => [v.event_id, v])), [visits]);

  const filtered = useMemo(() => {
    if (filterType === "all") return payload.events;
    return payload.events.filter((e) => {
      const v = visitMap.get(e.event_id);
      return v?.encounter_type === filterType;
    });
  }, [payload.events, filterType, visitMap]);

  const doiDate = payload.doi ? new Date(payload.doi) : null;

  function daysSinceDoi(dateLabel: string | null): number | null {
    if (!doiDate || !dateLabel) return null;
    const d = new Date(dateLabel);
    if (isNaN(d.getTime())) return null;
    return Math.round((d.getTime() - doiDate.getTime()) / 86400000);
  }

  const encounterTypes = useMemo(() => {
    const types = new Set(visits.map((v) => v.encounter_type));
    return Array.from(types);
  }, [visits]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="shrink-0 border-b border-border-dark px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-dark border border-border-dark text-slate-300 text-xs rounded px-2 py-1 font-bold uppercase tracking-wide"
          >
            <option value="all">All types</option>
            {encounterTypes.map((t) => (
              <option key={t} value={t}>{ENCOUNTER_LABELS[t] ?? t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowDoiCompare(!showDoiCompare)}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${showDoiCompare ? "bg-primary/10 text-primary border-primary/30" : "text-slate-500 border-border-dark hover:text-slate-300"}`}
          >
            <SortAsc className="w-3.5 h-3.5" />
            Days from DOI
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background-dark border-b border-border-dark z-10">
            <tr>
              <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-32">Date</th>
              {showDoiCompare && (
                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-20">Day+</th>
              )}
              <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-36">Provider</th>
              <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-28">Type</th>
              <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Key Finding</th>
              <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 w-24">Citations</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => {
              const v = visitMap.get(event.event_id);
              const isSelected = selectedEventId === event.event_id;
              const days = showDoiCompare ? daysSinceDoi(event.date) : null;
              const flags = v?.missing_required_buckets ?? [];
              const encounterLabel = ENCOUNTER_LABELS[v?.encounter_type ?? ""] ?? event.eventType;
              const isDelayed = days !== null && days > 30;

              return (
                <tr
                  key={event.event_id}
                  onClick={() => {
                    setSelectedEventId(event.event_id);
                    if (event.citationRefs[0]) {
                      setTrace({
                        claimText: event.summary.slice(0, 120),
                        citation: event.citationRefs[0],
                      });
                    }
                  }}
                  className={`border-b border-border-dark/50 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-surface-dark/60"} ${isDelayed ? "bg-orange-900/5" : ""}`}
                >
                  <td className={`px-4 py-3 font-mono text-xs font-bold ${isDelayed ? "text-orange-300" : "text-slate-400"}`}>
                    {event.dateLabel}
                  </td>
                  {showDoiCompare && (
                    <td className={`px-4 py-3 font-mono text-xs font-bold ${isDelayed ? "text-orange-400" : "text-slate-500"}`}>
                      {days !== null ? `+${days}d` : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-slate-300 font-medium truncate max-w-[144px]">
                    {event.providerName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                      {encounterLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{event.summary}</p>
                    {flags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {flags.map((f) => (
                          <span key={f} className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${FLAG_STYLES[f] ?? FLAG_STYLES.LOW_SUPPORT}`}>
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {event.citationRefs.slice(0, 3).map((c) => (
                        <CitationChip
                          key={c.citation_id}
                          citation={c}
                          claimText={event.summary.slice(0, 120)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                  No events match this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
