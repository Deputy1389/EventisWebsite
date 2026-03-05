"use client";

import { use, useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { adaptEvidenceGraphToWorkspace } from "@/lib/workspace-adapter";
import type { CaseWorkspacePayload } from "@/lib/workspace-types";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  finished_at?: string | null;
};

type Matter = {
  id: string;
  title: string;
};

const SUCCESS_STATUSES = new Set(["success", "partial", "completed", "needs_review"]);

function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [payload, setPayload] = useState<CaseWorkspacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedRuns = useMemo(
    () => runs.filter((r) => SUCCESS_STATUSES.has((r.status || "").toLowerCase())),
    [runs]
  );
  const latestRun = completedRuns[0] ?? null;

  const fetchCaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [matterRes, runsRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
      ]);
      if (matterRes.ok) setMatter(await matterRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  const fetchEvidenceGraph = useCallback(
    async (run: Run) => {
      setIsGraphLoading(true);
      try {
        const res = await fetch(
          `/api/citeline/runs/${run.id}/artifacts/by-name/evidence_graph.json`
        );
        if (!res.ok) {
          setError(`Failed to load evidence graph (HTTP ${res.status})`);
          return;
        }
        const raw = await res.json();
        const workspace = adaptEvidenceGraphToWorkspace(raw, {
          caseId,
          matterTitle: matter?.title ?? "Untitled Matter",
          runId: run.id,
          lastRunAt: run.finished_at ?? run.started_at ?? undefined,
        });
        setPayload(workspace);
      } catch (e) {
        setError(String(e));
      } finally {
        setIsGraphLoading(false);
      }
    },
    [caseId, matter?.title]
  );

  useEffect(() => {
    void fetchCaseData();
  }, [fetchCaseData]);

  useEffect(() => {
    if (latestRun && !payload) {
      void fetchEvidenceGraph(latestRun);
    }
  }, [latestRun, payload, fetchEvidenceGraph]);

  // Need to re-fetch graph if matter loaded after runs
  useEffect(() => {
    if (latestRun && matter && !payload && !isGraphLoading) {
      void fetchEvidenceGraph(latestRun);
    }
  }, [matter, latestRun, payload, isGraphLoading, fetchEvidenceGraph]);

  if (isLoading || (isGraphLoading && !payload)) {
    return (
      <div className="h-screen bg-background-dark flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">
          Loading Case Workspace
        </h2>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em] mt-3 animate-pulse">
          Building Evidence Graph…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background-dark flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-400 font-bold text-sm text-center max-w-md">{error}</p>
        <button
          onClick={() => { setError(null); setPayload(null); void fetchCaseData(); }}
          className="text-xs font-black uppercase tracking-widest text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!latestRun) {
    return (
      <div className="h-screen bg-background-dark flex flex-col items-center justify-center gap-3">
        <p className="text-slate-400 font-bold text-sm">No completed runs found for this matter.</p>
        <a
          href={`/app/cases/${caseId}`}
          className="text-xs font-black uppercase tracking-widest text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          ← Back to Case
        </a>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <WorkspaceShell payload={payload} />;
}

export default function ReviewPageWrapper(props: { params: Promise<{ caseId: string }> }) {
  return (
    <Suspense fallback={
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ReviewPage {...props} />
    </Suspense>
  );
}
