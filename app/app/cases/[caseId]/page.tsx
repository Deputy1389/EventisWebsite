"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Clock, FileText, Loader2, Trash2, Upload, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseApiError } from "@/lib/api-error";
import { uploadMatterDocument } from "@/lib/document-upload";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  heartbeat_at?: string | null;
  metrics?: {
    pages_total?: number;
    events_total?: number;
    providers_detected?: number;
    [key: string]: unknown;
  } | null;
  error_message?: string | null;
};

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

type Document = {
  id: string;
  filename: string;
  uploaded_at: string;
  bytes: number;
  page_count?: number;
};

const EXPORTABLE_STATUSES = new Set(["success", "partial", "needs_review", "completed"]);

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [firmTier, setFirmTier] = useState<string>("starter");
  const [runs, setRuns] = useState<Run[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestExportableRun = runs.find((r) => EXPORTABLE_STATUSES.has((r.status || "").toLowerCase()));
  const activeRun = runs.find((r) => r.status === "pending" || r.status === "running");
  
  const isPro = firmTier === "pro" || firmTier === "enterprise";

  const activeRunStale = (() => {
    if (!activeRun) return false;
    const ts = activeRun.heartbeat_at || activeRun.started_at;
    if (!ts) return false;
    const ageMs = Date.now() - new Date(ts).getTime();
    return ageMs > 10 * 60 * 1000;
  })();

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const metrics = latestExportableRun?.metrics || {
    pages_total: documents.reduce((acc, d) => acc + (d.page_count || 0), 0),
    events_total: 0,
    providers_detected: 0,
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.firmId) return;
    try {
      const [matterRes, runsRes, docsRes, firmRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
        fetch(`/api/citeline/matters/${caseId}/documents`),
        fetch(`/api/citeline/firms/${session.user.firmId}`),
      ]);

      if (matterRes.ok) setMatter(await matterRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (firmRes.ok) {
        const firmData = await firmRes.json();
        setFirmTier(firmData.tier || "starter");
      }
    } finally {
      setLoading(false);
    }
  }, [caseId, session?.user?.firmId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const hasActive = runs.some((r) => r.status === "pending" || r.status === "running");
    if (!hasActive) return;
    const timer = setInterval(() => {
      void fetchData();
    }, 5000);
    return () => clearInterval(timer);
  }, [runs, fetchData]);

  async function handleDelete() {
    if (!confirm("Delete this matter permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Matter deleted");
        router.push("/app/cases");
      } else {
        const errorText = await res.text();
        toast.error(parseApiError(errorText) || "Delete failed");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadMatterDocument(caseId, file);
      const runRes = await fetch(`/api/citeline/matters/${caseId}/runs`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!runRes.ok) {
        const errorText = await runRes.text();
        toast.error(parseApiError(errorText) || "Failed to start run");
        return;
      }
      toast.success("Upload complete. Opening Audit Mode...");
      void fetchData();
      router.push(`/app/cases/${caseId}/review`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDownload(type: string) {
    if (!latestExportableRun) {
      toast.error("No exportable run yet");
      return;
    }
    
    if (type === "expert_binder" && !isPro) {
      toast.error("Expert Binder is a Pro feature. Please upgrade your plan.");
      return;
    }

    const query = type === "pdf" || type === "expert_binder" ? "?export_mode=INTERNAL" : "";
    const artifactType = type === "expert_binder" ? "pdf" : type; // They currently both use the detailed internal PDF
    
    window.open(`/api/citeline/runs/${latestExportableRun.id}/artifacts/${artifactType}${query}`, "_blank");
  }

  async function handleCancelRun(runId: string) {
    try {
      const res = await fetch(`/api/citeline/runs/${runId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(parseApiError(errorText) || "Cancel failed");
        return;
      }
      toast.success("Run cancelled");
      void fetchData();
    } catch {
      toast.error("Cancel failed");
    }
  }

  async function handleForceFail(runId: string) {
    try {
      const res = await fetch(`/api/citeline/runs/${runId}/force-fail`, { method: "POST" });
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(parseApiError(errorText) || "Force fail failed");
        return;
      }
      toast.success("Run force-failed");
      void fetchData();
    } catch {
      toast.error("Force fail failed");
    }
  }

  async function handleRetryRun() {
    if (activeRun) {
      await handleForceFail(activeRun.id);
    }
    const res = await fetch(`/api/citeline/matters/${caseId}/runs`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const errorText = await res.text();
      toast.error(parseApiError(errorText) || "Failed to start retry");
      return;
    }
    toast.success("Retry started");
    void fetchData();
  }

  if (loading) return <div className="flex h-[60vh] items-center justify-center">Loading matter...</div>;
  if (!matter) return <div className="py-20 text-center">Matter not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/cases">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">{matter.title}</h1>
            <p className="text-sm text-muted-foreground">Created {new Date(matter.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <Badge variant={isPro ? "default" : "secondary"} className="uppercase tracking-widest text-[10px]">
          {firmTier} Tier
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-background/75 p-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Pages</p>
          <p className="mt-1 text-2xl font-bold">{Number(metrics.pages_total || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Events</p>
          <p className="mt-1 text-2xl font-bold">{Number(metrics.events_total || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Providers</p>
          <p className="mt-1 text-2xl font-bold">{Number(metrics.providers_detected || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Ref</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono text-xs break-all">{caseId}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard("Case ID", caseId)}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>

      {activeRun && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-black">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Extraction run is active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeRunStale && (
              <div className="mb-2 text-xs text-destructive font-bold uppercase">
                This run appears stalled. You can cancel and retry.
              </div>
            )}
            <div className="grid gap-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:grid-cols-4 font-black">
              <span className="rounded-md bg-background/80 px-2 py-1 text-primary border border-primary/20">Done: OCR</span>
              <span className="rounded-md bg-background/80 px-2 py-1 text-primary border border-primary/20">Active: Mapping</span>
              <span className="rounded-md bg-background/80 px-2 py-1 bg-surface-dark">Next: Gap Analysis</span>
              <span className="rounded-md bg-background/80 px-2 py-1 bg-surface-dark">Next: Export</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest" onClick={() => handleCancelRun(activeRun.id)}>
                Cancel Run
              </Button>
              <Button variant="destructive" size="sm" className="text-[10px] font-black uppercase tracking-widest" onClick={() => handleForceFail(activeRun.id)}>
                Force Fail
              </Button>
              <Button variant="secondary" size="sm" className="text-[10px] font-black uppercase tracking-widest" onClick={handleRetryRun}>
                Retry Run
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-widest font-black text-sm">Source Documents</CardTitle>
              <CardDescription>All uploaded packet files.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Filename</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Uploaded</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">No documents uploaded.</TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-bold text-white text-xs">{doc.filename}</TableCell>
                        <TableCell className="text-xs text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right text-xs text-slate-400">{(doc.bytes / 1024 / 1024).toFixed(2)} MB</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-widest font-black text-sm">Run History</CardTitle>
              <CardDescription>Latest processing activity for this matter.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Run</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Started</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground italic">No runs yet.</TableCell>
                    </TableRow>
                  ) : (
                    runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-mono text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="break-all">{run.id}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard("Run ID", run.id)}
                            >
                              <Icon name="content_copy" className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={EXPORTABLE_STATUSES.has((run.status || "").toLowerCase()) ? "default" : "secondary"} className="text-[9px] uppercase font-black tracking-widest">
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{run.started_at ? new Date(run.started_at).toLocaleString() : "Pending"}</TableCell>
                        <TableCell className="text-right">
                          {EXPORTABLE_STATUSES.has((run.status || "").toLowerCase()) ? (
                            <Button size="sm" variant="outline" className="text-[10px] font-black uppercase tracking-widest" asChild>
                              <Link href={`/app/cases/${caseId}/review`}>Open Audit Mode</Link>
                            </Button>
                          ) : (
                            <Clock className="ml-auto h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-surface-dark/50">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between h-12 text-[11px] font-black uppercase tracking-widest" variant="outline" onClick={() => handleDownload("pdf")}>
                <div className="flex items-center">
                  <FileText className="mr-3 h-4 w-4 text-primary" />
                  Chronology PDF
                </div>
                <Icon name="download" className="h-4 w-4" />
              </Button>
              
              <div className="relative group">
                <Button 
                  className={`w-full justify-between h-12 text-[11px] font-black uppercase tracking-widest ${isPro ? '' : 'opacity-60 cursor-not-allowed bg-slate-900'}`} 
                  variant={isPro ? "outline" : "ghost"}
                  onClick={() => handleDownload("expert_binder")}
                >
                  <div className="flex items-center">
                    <Icon name="folder_zip" className="mr-3 h-4 w-4 text-primary" />
                    Expert Binder
                  </div>
                  {!isPro && <Lock className="h-3.5 w-3.5 text-slate-500" />}
                  {isPro && <Icon name="download" className="h-4 w-4" />}
                </Button>
                {!isPro && (
                  <div className="absolute right-2 -top-2">
                    <Badge className="bg-primary text-white text-[8px] px-1 py-0 font-black">PRO</Badge>
                  </div>
                )}
              </div>

              <Button className="w-full justify-between h-12 text-[11px] font-black uppercase tracking-widest" variant="outline" onClick={() => handleDownload("specials_summary_pdf")}>
                <div className="flex items-center">
                  <Icon name="receipt_long" className="mr-3 h-4 w-4 text-primary" />
                  Specials Summary
                </div>
                <Icon name="download" className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between h-12 text-[11px] font-black uppercase tracking-widest" variant="outline" onClick={() => handleDownload("missing_records_csv")}>
                <div className="flex items-center">
                  <Icon name="rule" className="mr-3 h-4 w-4 text-primary" />
                  Missing Records CSV
                </div>
                <Icon name="download" className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-surface-dark/50">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
              <Button className="w-full h-12 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/10" variant="secondary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload More Documents
                  </>
                )}
              </Button>
              <Button className="w-full h-12 text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10" variant="outline" disabled={deleting} onClick={handleDelete}>     
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Matter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
