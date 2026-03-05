"use client";

import { useState, useMemo } from "react";
import { CitationChip } from "./CitationChip";
import { DemandBuilderTab } from "./DemandBuilderTab";
import { MediationPacketTab } from "./MediationPacketTab";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";

interface PrepPackTabProps {
  payload: CaseWorkspacePayload;
}

type SubTab = "depositions" | "demand" | "mediation";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "depositions", label: "Depositions" },
  { id: "demand",      label: "Demand Builder" },
  { id: "mediation",  label: "Mediation Packet" },
];

export function PrepPackTab({ payload }: PrepPackTabProps) {
  const [subTab, setSubTab] = useState<SubTab>("demand");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="shrink-0 flex gap-0 border-b border-border-dark bg-background-dark px-4">
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
              subTab === id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-hidden">
        {subTab === "depositions" && <DepositionsPane payload={payload} />}
        {subTab === "demand"      && <DemandBuilderTab payload={payload} />}
        {subTab === "mediation"   && <MediationPacketTab payload={payload} />}
      </div>
    </div>
  );
}

// ── Depositions sub-tab (moved from old PrepPackTab) ──────────────────────

function DepositionsPane({ payload }: { payload: CaseWorkspacePayload }) {
  const { providers, visits, citations } = payload;

  const providerRanks = useMemo(() => {
    const countMap = new Map<string, number>();
    const roleMap = new Map<string, string>();
    for (const v of visits) {
      if (v.provider_id) {
        countMap.set(v.provider_id, (countMap.get(v.provider_id) ?? 0) + 1);
        roleMap.set(v.provider_id, v.provider_role);
      }
    }
    return providers
      .map((p) => ({
        ...p,
        visitCount: countMap.get(p.provider_id) ?? 0,
        role: roleMap.get(p.provider_id) ?? p.provider_role,
      }))
      .filter((p) => p.visitCount > 0)
      .sort((a, b) => b.visitCount - a.visitCount);
  }, [providers, visits]);

  function getProviderVisits(providerId: string) {
    return visits.filter((v) => v.provider_id === providerId).slice(0, 5);
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-4">
      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Depositions</h3>
        <p className="text-xs text-slate-600 mb-4">Providers ranked by involvement. Click any citation to view in record.</p>

        {providerRanks.length === 0 ? (
          <div className="py-8 text-center border border-border-dark rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest">
            No providers extracted
          </div>
        ) : (
          <div className="space-y-4">
            {providerRanks.map((provider) => {
              const provVisits = getProviderVisits(provider.provider_id);
              const keyFindings = provVisits
                .flatMap((v) => v.buckets.diagnoses.slice(0, 2))
                .filter(Boolean)
                .slice(0, 3);
              const allCitIds = provVisits.flatMap((v) => v.citation_ids).slice(0, 4);

              return (
                <div key={provider.provider_id} className="border border-border-dark rounded-xl overflow-hidden">
                  <div className="bg-surface-dark/50 px-4 py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">{provider.provider_name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">
                        {provider.role.replace(/_/g, " ")} · {provider.visitCount} visit{provider.visitCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {allCitIds.map((cid) => {
                        const c = citations.get(cid);
                        return c ? <CitationChip key={cid} citation={c} claimText={provider.provider_name} /> : null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {keyFindings.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Key Findings</p>
                        <ul className="space-y-1">
                          {keyFindings.map((f, i) => (
                            <li key={i} className="text-xs text-slate-300">• {f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Suggested Topics</p>
                      <DepoTopics role={provider.role} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DepoTopics({ role }: { role: string }) {
  const TOPICS: Record<string, string[]> = {
    er: ["Mechanism of injury described by patient", "Initial pain complaints", "Discharge instructions given"],
    imaging: ["Technique used and quality of study", "Specific findings noted", "Clinical correlation required"],
    specialist: ["Causation opinion", "Permanency assessment", "Treatment recommendations given"],
    surgery: ["Surgical findings vs. pre-op imaging", "Complications if any", "Post-op prognosis"],
    therapy: ["Functional limitations documented", "Progress toward goals", "Compliance with attendance"],
    primary_care: ["Referral decisions", "Initial diagnosis", "Ongoing care plan"],
    follow_up: ["Ongoing symptoms", "Work restrictions", "Future treatment needed"],
  };
  const topics = TOPICS[role] ?? TOPICS.follow_up;
  return (
    <ul className="space-y-1">
      {topics.map((t, i) => (
        <li key={i} className="text-[10px] text-slate-500">• {t}</li>
      ))}
    </ul>
  );
}
