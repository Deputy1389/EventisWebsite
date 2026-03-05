"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CitationRef } from "./workspace-types";

export interface TraceItem {
  claimText: string;
  citation: CitationRef;
  exhibitLabel?: string;
}

/** List mode: triggered from page badge — shows all citations on a page */
export interface TraceList {
  pageNumber: number;
  items: TraceItem[];
}

interface EvidenceTraceContextType {
  trace: TraceItem | null;
  traceList: TraceList | null;
  setTrace: (item: TraceItem | null) => void;
  setTraceList: (list: TraceList | null) => void;
}

const EvidenceTraceContext = createContext<EvidenceTraceContextType>({
  trace: null,
  traceList: null,
  setTrace: () => {},
  setTraceList: () => {},
});

export function EvidenceTraceProvider({ children }: { children: ReactNode }) {
  const [trace, setTrace] = useState<TraceItem | null>(null);
  const [traceList, setTraceList] = useState<TraceList | null>(null);

  function handleSetTrace(item: TraceItem | null) {
    setTrace(item);
    setTraceList(null);  // single-item mode clears list mode
  }

  function handleSetTraceList(list: TraceList | null) {
    setTraceList(list);
    setTrace(null);  // list mode clears single-item mode
  }

  return (
    <EvidenceTraceContext.Provider
      value={{ trace, traceList, setTrace: handleSetTrace, setTraceList: handleSetTraceList }}
    >
      {children}
    </EvidenceTraceContext.Provider>
  );
}

export function useEvidenceTrace() {
  return useContext(EvidenceTraceContext);
}
