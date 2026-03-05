"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Download, Loader2, CheckCircle2, FileWarning } from "lucide-react";
import { CitationChip } from "./CitationChip";
import type {
  CaseWorkspacePayload,
  DemandTone,
  DraftDemand,
  DraftSections,
  SectionKey,
} from "@/lib/workspace-types";
import { SECTION_LABELS } from "@/lib/workspace-types";
import { toast } from "sonner";

interface DemandBuilderTabProps {
  payload: CaseWorkspacePayload;
}

const TONES: { value: DemandTone; label: string }[] = [
  { value: "aggressive",   label: "Aggressive" },
  { value: "moderate",     label: "Moderate" },
  { value: "conservative", label: "Conservative" },
];

const SECTION_ORDER: SectionKey[] = [
  "liability",
  "injuries",
  "treatment",
  "specials",
  "demand_amount",
];

type SaveStatus = "saved" | "saving" | "unsaved";

export function DemandBuilderTab({ payload }: DemandBuilderTabProps) {
  const { caseId, runId, citations } = payload;

  const [draft, setDraft] = useState<DraftDemand | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("liability");
  const [tone, setTone] = useState<DemandTone>("moderate");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [regenerating, setRegenerating] = useState<Partial<Record<SectionKey, boolean>>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [loadError, setLoadError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/citeline/matters/${caseId}/demand-drafts`);
        if (!res.ok) return;
        const drafts: DraftDemand[] = await res.json();
        const latest = drafts.find((d) => d.run_id === runId) ?? drafts[0] ?? null;
        if (latest) {
          setDraft(latest);
          setDraftId(latest.id);
          setTone((latest.tone as DemandTone) ?? "moderate");
        }
      } catch {
        // No draft yet — that's fine
      }
    })();
  }, [caseId, runId]);

  // ── Generate ──────────────────────────────────────────────────────────────

  async function generate(sectionKey?: SectionKey) {
    if (sectionKey) {
      setRegenerating((r) => ({ ...r, [sectionKey]: true }));
    } else {
      setIsGeneratingAll(true);
    }
    setLoadError(null);

    try {
      const res = await fetch(`/api/citeline/matters/${caseId}/demand-narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runId,
          tone,
          section: sectionKey ?? null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        const msg = typeof err.detail === "string" ? err.detail : "Generation failed";
        setLoadError(msg);
        toast.error(msg);
        return;
      }

      const data: { draft_id: string; sections: DraftSections } = await res.json();
      setDraftId(data.draft_id);

      // Merge new sections into the existing draft
      setDraft((prev) => {
        const existing = prev?.sections ?? {};
        return {
          id: data.draft_id,
          case_id: caseId,
          run_id: runId,
          tone,
          created_at: prev?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { ...existing, ...data.sections },
        };
      });

      if (!sectionKey) {
        // Navigate to first section after full generation
        setActiveSection("liability");
      }
    } finally {
      if (sectionKey) {
        setRegenerating((r) => ({ ...r, [sectionKey]: false }));
      } else {
        setIsGeneratingAll(false);
      }
    }
  }

  // ── Auto-save ─────────────────────────────────────────────────────────────

  const saveDraft = useCallback(
    async (section: SectionKey, text: string) => {
      if (!draftId) return;
      setSaveStatus("saving");
      try {
        await fetch(`/api/citeline/matters/${caseId}/demand-drafts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, text }),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    },
    [caseId, draftId]
  );

  function handleTextChange(section: SectionKey, text: string) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            sections: {
              ...prev.sections,
              [section]: { ...(prev.sections[section] ?? { citations: [] }), text },
            },
          }
        : prev
    );
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void saveDraft(section, text), 500);
  }

  // ── Download ──────────────────────────────────────────────────────────────

  function downloadDraft() {
    if (!draft) return;
    const lines: string[] = [`DEMAND LETTER DRAFT — ${payload.matterTitle}`, ""];
    for (const key of SECTION_ORDER) {
      const sec = draft.sections[key];
      if (!sec) continue;
      lines.push(`## ${SECTION_LABELS[key].toUpperCase()}`, "");
      lines.push(sec.text, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demand_draft_${caseId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const activeData = draft?.sections[activeSection];
  const hasDraft = !!draft && Object.keys(draft.sections).length > 0;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Section navigation */}
      <div className="w-52 shrink-0 border-r border-border-dark flex flex-col bg-background-dark">
        {/* Tone selector */}
        <div className="p-3 border-b border-border-dark space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tone</p>
          <div className="flex gap-1">
            {TONES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                className={`flex-1 text-[9px] font-black uppercase tracking-wide py-1.5 rounded transition-all ${
                  tone === value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-slate-500 border border-border-dark hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Section list */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {SECTION_ORDER.map((key) => {
            const isActive = activeSection === key;
            const hasSec = !!draft?.sections[key];
            const isRegen = !!regenerating[key];

            return (
              <button
                key={key}
                onClick={() => { setActiveSection(key); }}
                disabled={isRegen}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-surface-dark border border-transparent"
                }`}
              >
                <span className="truncate">{SECTION_LABELS[key]}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void generate(key);
                  }}
                  disabled={isRegen || isGeneratingAll}
                  title={`Regenerate ${SECTION_LABELS[key]}`}
                  className="shrink-0 p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-all"
                >
                  {isRegen ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className={`w-3 h-3 ${hasSec ? "text-cyan-400" : "text-slate-600"}`} />
                  )}
                </button>
              </button>
            );
          })}
        </nav>

        {/* Generate all + download */}
        <div className="p-3 border-t border-border-dark space-y-2">
          <button
            onClick={() => void generate()}
            disabled={isGeneratingAll}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-50 transition-all"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Generating…
              </>
            ) : (
              "Generate All"
            )}
          </button>

          {hasDraft && (
            <button
              onClick={downloadDraft}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-400 border border-border-dark hover:text-white hover:border-slate-500 transition-all"
            >
              <Download className="w-3 h-3" />
              Download Draft
            </button>
          )}
        </div>
      </div>

      {/* Right: Section editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="shrink-0 h-10 border-b border-border-dark flex items-center justify-between px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {SECTION_LABELS[activeSection]}
          </p>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-[9px] text-slate-500 flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving…
              </span>
            )}
            {saveStatus === "saved" && draftId && (
              <span className="text-[9px] text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Saved
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-[9px] text-yellow-500">Unsaved</span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {loadError && (
          <div className="shrink-0 mx-4 mt-3 flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-300">
            <FileWarning className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Empty state */}
        {!hasDraft && !isGeneratingAll && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-slate-400 text-sm font-bold">No draft yet.</p>
            <p className="text-slate-600 text-xs max-w-xs">
              Click <strong className="text-slate-400">Generate All</strong> to create a full demand
              narrative from the evidence graph, or use the <strong className="text-slate-400">↺</strong>{" "}
              buttons to generate individual sections.
            </p>
            <button
              onClick={() => void generate()}
              className="mt-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              Generate All Sections
            </button>
          </div>
        )}

        {/* Generating all spinner */}
        {isGeneratingAll && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Building demand narrative…
            </p>
          </div>
        )}

        {/* Section editor */}
        {hasDraft && !isGeneratingAll && (
          <div className="flex-1 flex overflow-hidden">
            {/* Text area */}
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <textarea
                value={activeData?.text ?? ""}
                onChange={(e) => handleTextChange(activeSection, e.target.value)}
                placeholder={
                  regenerating[activeSection]
                    ? "Regenerating…"
                    : "Click ↺ to generate this section…"
                }
                disabled={!!regenerating[activeSection]}
                className="flex-1 bg-surface-dark/30 border border-border-dark rounded-xl p-4 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-primary/30 placeholder:text-slate-600 disabled:opacity-50 custom-scrollbar"
              />
            </div>

            {/* Citations sidebar */}
            {activeData && activeData.citations.length > 0 && (
              <div className="w-44 shrink-0 border-l border-border-dark p-3 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Citations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeData.citations.map((cid) => {
                    const c = citations.get(cid);
                    return c ? (
                      <CitationChip
                        key={cid}
                        citation={c}
                        claimText={`${SECTION_LABELS[activeSection]} — p.${c.page_number}`}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
