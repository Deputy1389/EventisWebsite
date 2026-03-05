"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CitationRef } from "./workspace-types";

export interface TraceItem {
  claimText: string;
  citation: CitationRef;
  exhibitLabel?: string;
}

interface EvidenceTraceContextType {
  trace: TraceItem | null;
  setTrace: (item: TraceItem | null) => void;
}

const EvidenceTraceContext = createContext<EvidenceTraceContextType>({
  trace: null,
  setTrace: () => {},
});

export function EvidenceTraceProvider({ children }: { children: ReactNode }) {
  const [trace, setTrace] = useState<TraceItem | null>(null);
  return (
    <EvidenceTraceContext.Provider value={{ trace, setTrace }}>
      {children}
    </EvidenceTraceContext.Provider>
  );
}

export function useEvidenceTrace() {
  return useContext(EvidenceTraceContext);
}
