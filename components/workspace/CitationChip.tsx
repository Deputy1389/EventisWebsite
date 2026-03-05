"use client";

import { useEvidenceTrace } from "@/lib/workspace-context";
import type { CitationRef } from "@/lib/workspace-types";

interface CitationChipProps {
  citation: CitationRef;
  claimText?: string;
  exhibitLabel?: string;
}

export function CitationChip({ citation, claimText = "", exhibitLabel }: CitationChipProps) {
  const { setTrace } = useEvidenceTrace();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setTrace({ claimText, citation, exhibitLabel });
      }}
      title={citation.snippet ? `"${citation.snippet}"` : `Page ${citation.page_number}`}
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold font-mono bg-cyan-900/40 text-cyan-300 hover:bg-cyan-700/60 border border-cyan-700/50 transition-all cursor-pointer whitespace-nowrap"
    >
      p.{citation.page_number}
    </button>
  );
}
