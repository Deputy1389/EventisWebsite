"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const PDFDocument = dynamic(
  () => import("react-pdf").then((m) => m.Document),
  { ssr: false, loading: () => <PdfLoader /> }
);

const PDFPage = dynamic(
  () => import("react-pdf").then((m) => m.Page),
  { ssr: false }
);

// Configure pdfjs worker on client side only
function usePdfjsWorker() {
  useEffect(() => {
    import("react-pdf").then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);
}

interface RecordViewerProps {
  /** URL to fetch the PDF from */
  fileUrl: string;
  /** 1-indexed page to jump to */
  initialPage?: number;
  /** Snippet to highlight in the text layer */
  highlightQuery?: string;
  /** Display label (e.g. "Valley Radiology MRI Report") */
  sourceLabel?: string;
}

export function RecordViewer({
  fileUrl,
  initialPage = 1,
  highlightQuery,
  sourceLabel,
}: RecordViewerProps) {
  usePdfjsWorker();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import TextLayer CSS once on client
  useEffect(() => {
    import("react-pdf/dist/Page/TextLayer.css" as string).catch(() => {});
    import("react-pdf/dist/Page/AnnotationLayer.css" as string).catch(() => {});
  }, []);

  // Jump to initial page when prop changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message);
    setLoading(false);
  }

  // Highlight matching text in PDF.js text layer
  const customTextRenderer = useCallback(
    ({ str }: { str: string }) => {
      if (!highlightQuery) return str;
      const q = highlightQuery.trim().toLowerCase();
      const strLow = str.toLowerCase();
      if (!q || !strLow.includes(q)) return str;

      const idx = strLow.indexOf(q);
      const before = str.slice(0, idx);
      const match = str.slice(idx, idx + q.length);
      const after = str.slice(idx + q.length);
      return `${before}<mark class="lc-highlight">${match}</mark>${after}`;
    },
    [highlightQuery]
  );

  const canPrev = currentPage > 1;
  const canNext = numPages != null && currentPage < numPages;

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-background-dark border-b border-border-dark">
        <div className="text-[10px] font-mono font-bold text-slate-400 truncate">
          {sourceLabel && <span className="text-slate-300 mr-2">{sourceLabel}</span>}
          {numPages != null && (
            <span>Page <span className="text-white font-black">{currentPage}</span> of {numPages}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-surface-dark disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => (numPages ? Math.min(numPages, p + 1) : p))}
            disabled={!canNext}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-surface-dark disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div className="flex-1 overflow-auto flex justify-center py-4 relative">
        {/* Highlight CSS injected inline */}
        <style>{`
          .lc-highlight {
            background: rgba(250, 204, 21, 0.45);
            border-radius: 2px;
            padding: 0 1px;
            color: inherit;
          }
        `}</style>

        {error ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Failed to load document. <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary underline">Open directly</a>
          </div>
        ) : (
          <PDFDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<PdfLoader />}
          >
            <PDFPage
              pageNumber={currentPage}
              renderTextLayer
              renderAnnotationLayer={false}
              customTextRenderer={customTextRenderer}
              className="shadow-2xl"
              width={Math.min(700, typeof window !== "undefined" ? window.innerWidth - 64 : 700)}
            />
          </PDFDocument>
        )}
      </div>
    </div>
  );
}

function PdfLoader() {
  return (
    <div className="flex items-center justify-center h-64 w-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
