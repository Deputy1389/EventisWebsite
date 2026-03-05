"use client";

import { useEvidenceTrace } from "@/lib/workspace-context";
import { ExternalLink, FileText, Layers } from "lucide-react";

interface EvidenceTracePanelProps {
  caseId: string;
}

export function EvidenceTracePanel({ caseId }: EvidenceTracePanelProps) {
  const { trace, traceList, setTrace } = useEvidenceTrace();

  // Empty state
  if (!trace && !traceList) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <FileText className="w-8 h-8 text-slate-700 mb-3" />
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
          Click any finding to see its source evidence
        </p>
      </div>
    );
  }

  // List mode: all citations on a page (from badge click)
  if (traceList) {
    return (
      <div className="h-full flex flex-col p-4 gap-3 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Page {traceList.pageNumber} — {traceList.items.length} claim{traceList.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {traceList.items.map((item, idx) => {
            const { citation } = item;
            const viewerUrl = `/app/cases/${caseId}/records/${citation.source_document_id}?page=${citation.page_number}${citation.snippet ? `&q=${encodeURIComponent(citation.snippet)}` : ""}`;
            return (
              <button
                key={idx}
                onClick={() => setTrace(item)}
                className="w-full text-left border border-border-dark rounded-xl p-3 hover:border-cyan-700 hover:bg-surface-dark/40 transition-all group"
              >
                <p className="text-xs text-slate-300 font-medium group-hover:text-white leading-snug line-clamp-2">
                  {item.claimText}
                </p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span className="text-[9px] font-mono text-cyan-400">p.{citation.page_number}</span>
                  <a
                    href={viewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] text-slate-600 hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                {citation.snippet && (
                  <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                    &ldquo;{citation.snippet}&rdquo;
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Single-item mode
  if (!trace) return null;
  const { claimText, citation, exhibitLabel } = trace;
  const viewerUrl = `/app/cases/${caseId}/records/${citation.source_document_id}?page=${citation.page_number}${citation.snippet ? `&q=${encodeURIComponent(citation.snippet)}` : ""}`;

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Claim */}
      {claimText && (
        <section>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Claim</p>
          <p className="text-sm text-white font-medium leading-relaxed">{claimText}</p>
        </section>
      )}

      {/* Source */}
      <section className="bg-surface-dark border border-border-dark rounded-xl p-3">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Source</p>
        {exhibitLabel && (
          <p className="text-xs font-bold text-cyan-300 mb-0.5">{exhibitLabel}</p>
        )}
        <p className="text-xs font-bold text-slate-300">
          Page <span className="font-mono text-white">{citation.page_number}</span>
        </p>
        {citation.source_document_id && (
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{citation.source_document_id.slice(0, 16)}…</p>
        )}
      </section>

      {/* Snippet */}
      {citation.snippet && (
        <section>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Snippet</p>
          <blockquote className="border-l-2 border-cyan-700 pl-3 text-xs text-slate-300 italic leading-relaxed">
            &ldquo;{citation.snippet}&rdquo;
          </blockquote>
        </section>
      )}

      {/* Open full page */}
      <div className="mt-auto">
        <a
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest py-2.5 rounded-lg transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open full page
        </a>
      </div>
    </div>
  );
}
