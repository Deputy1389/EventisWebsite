"use client";

import { useMemo } from "react";
import { CitationChip } from "./CitationChip";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface PrepPackTabProps {
  payload: CaseWorkspacePayload;
}

export function PrepPackTab({ payload }: PrepPackTabProps) {
  const { providers, visits, citations } = payload;

  // Rank providers by involvement (visit count)
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

  // Get visits for a provider
  function getProviderVisits(providerId: string) {
    return visits.filter((v) => v.provider_id === providerId).slice(0, 5);
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Deposition sub-tab */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
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
                    {/* Provider header */}
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

                    {/* Key findings */}
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

                      {/* Suggested deposition topics stub */}
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

      {/* Locked: Demand Builder + Mediation Packet */}
      <div className="w-64 shrink-0 border-l border-border-dark p-4 space-y-3 flex flex-col">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Coming Next Release</p>

        <LockedCard
          title="Demand Builder"
          description="Editable demand letter sections with every paragraph evidence-anchored."
          onClick={() => toast.info("Demand Builder is coming in the next release.")}
        />
        <LockedCard
          title="Mediation Packet"
          description="One-page case summary with strengths, risks, escalation timeline, and key exhibits."
          onClick={() => toast.info("Mediation Packet export is coming in the next release.")}
        />
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

function LockedCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-border-dark rounded-xl p-4 bg-surface-dark/20 hover:bg-surface-dark/40 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Lock className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{title}</p>
      </div>
      <p className="text-[10px] text-slate-600 leading-relaxed">{description}</p>
    </button>
  );
}
