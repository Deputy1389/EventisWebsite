"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { EvidenceTraceProvider } from "@/lib/workspace-context";
import { EvidenceTracePanel } from "./EvidenceTracePanel";
import { CaseHealthWidget } from "./CaseHealthWidget";
import { CaseMapTab } from "./CaseMapTab";
import { TimelineTab } from "./TimelineTab";
import { InjuriesTab } from "./InjuriesTab";
import { TreatmentTab } from "./TreatmentTab";
import { DefenseStrategyTab } from "./DefenseStrategyTab";
import { PrepPackTab } from "./PrepPackTab";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";
import {
  Map,
  Clock,
  Activity,
  Stethoscope,
  Shield,
  BookOpen,
  Scale,
  Download,
  FileText,
} from "lucide-react";

export type TabId = "map" | "timeline" | "injuries" | "treatment" | "defense" | "prep";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "map", label: "Case Map", icon: Map },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "injuries", label: "Injuries", icon: Activity },
  { id: "treatment", label: "Treatment & Specials", icon: Stethoscope },
  { id: "defense", label: "Defense Strategy", icon: Shield },
  { id: "prep", label: "Prep Pack", icon: BookOpen },
];

interface WorkspaceShellProps {
  payload: CaseWorkspacePayload;
}

export function WorkspaceShell({ payload }: WorkspaceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") ?? "map") as TabId;

  function setTab(id: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const sli = payload.settlement.leverage?.settlement_leverage_index;
  const sliPct = sli != null ? Math.round(sli * 100) : null;
  const statusColor =
    payload.health.bucketFillRate >= 0.8
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : payload.health.bucketFillRate >= 0.6
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20";
  const statusLabel =
    payload.health.bucketFillRate >= 0.8
      ? "Ready"
      : payload.health.encountersMissingBuckets > 0
      ? "Needs Review"
      : "Ready";

  return (
    <EvidenceTraceProvider>
      <div className="h-screen -m-8 flex flex-col bg-background-dark text-slate-100 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 border-b border-border-dark flex items-center justify-between px-6 z-20 bg-background-dark">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-2.5 text-white shrink-0">
              <Scale className="w-5 h-5 text-primary" />
              <span className="text-sm font-black tracking-tighter uppercase">LineCite</span>
            </div>
            <div className="h-5 w-px bg-border-dark shrink-0" />
            <p className="text-sm font-bold text-white truncate">{payload.matterTitle}</p>
            {payload.doi && (
              <span className="text-[10px] font-mono text-slate-500 shrink-0">DOI: {payload.doi}</span>
            )}
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${statusColor} shrink-0`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {sliPct != null && (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-[9px] font-black uppercase tracking-widest">SLI</span>
                <span className="font-mono font-black text-white text-sm">{sliPct}</span>
              </div>
            )}
            <div className="h-5 w-px bg-border-dark" />
            <a
              href={`/api/citeline/runs/${payload.runId}/artifacts/by-name/evidence_graph.json`}
              download="evidence_graph.json"
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </a>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left rail */}
          <aside className="w-52 shrink-0 border-r border-border-dark flex flex-col bg-background-dark">
            <nav className="flex-1 p-2 space-y-0.5">
              {TABS.map(({ id, label, icon: TabIcon }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-slate-500 hover:text-slate-300 hover:bg-surface-dark border border-transparent"
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>
            <CaseHealthWidget health={payload.health} lastRunAt={payload.lastRunAt} />
          </aside>

          {/* Main content */}
          <main className="flex-1 flex overflow-hidden min-w-0">
            <div className="flex-1 overflow-hidden">
              {tab === "map" && <CaseMapTab payload={payload} />}
              {tab === "timeline" && <TimelineTab payload={payload} />}
              {tab === "injuries" && <InjuriesTab payload={payload} />}
              {tab === "treatment" && <TreatmentTab payload={payload} />}
              {tab === "defense" && <DefenseStrategyTab payload={payload} />}
              {tab === "prep" && <PrepPackTab payload={payload} />}
            </div>

            {/* Right Evidence Trace panel */}
            <aside className="w-72 shrink-0 border-l border-border-dark bg-background-dark flex flex-col">
              <div className="shrink-0 h-11 border-b border-border-dark flex items-center gap-2 px-4">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Trace</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <EvidenceTracePanel caseId={payload.caseId} />
              </div>
            </aside>
          </main>
        </div>
      </div>
    </EvidenceTraceProvider>
  );
}
