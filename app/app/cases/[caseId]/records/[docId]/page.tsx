"use client";

import { use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RecordViewer } from "@/components/workspace/RecordViewer";
import { ArrowLeft, Loader2 } from "lucide-react";

function RecordPage({ params }: { params: Promise<{ caseId: string; docId: string }> }) {
  const { caseId, docId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const query = searchParams.get("q") ?? undefined;
  const fromTab = searchParams.get("from") ?? "map";

  const fileUrl = `/api/citeline/documents/${docId}/download`;
  const backUrl = `/app/cases/${caseId}/review?tab=${fromTab}`;

  return (
    <div className="h-screen -m-8 flex flex-col bg-[#1a1a1a]">
      {/* Back bar */}
      <div className="shrink-0 h-11 bg-background-dark border-b border-border-dark flex items-center gap-3 px-4">
        <button
          onClick={() => router.push(backUrl)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </button>
        <div className="h-4 w-px bg-border-dark" />
        {query && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Highlighting:</span>
            <span className="text-[10px] font-mono text-yellow-300 bg-yellow-900/30 border border-yellow-700/40 rounded px-2 py-0.5">
              &ldquo;{query.slice(0, 60)}{query.length > 60 ? "…" : ""}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <RecordViewer
          fileUrl={fileUrl}
          initialPage={isNaN(page) ? 1 : page}
          highlightQuery={query}
        />
      </div>
    </div>
  );
}

export default function RecordPageWrapper(props: { params: Promise<{ caseId: string; docId: string }> }) {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <RecordPage {...props} />
    </Suspense>
  );
}
