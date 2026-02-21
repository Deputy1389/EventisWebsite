"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Clock, FileText, Loader2, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseApiError } from "@/lib/api-error";

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

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestSuccessRun = runs.find((r) => r.status === "success");
  const activeRun = runs.find((r) => r.status === "pending" || r.status === "running");
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

  const metrics = latestSuccessRun?.metrics || {
    pages_total: documents.reduce((acc, d) => acc + (d.page_count || 0), 0),
    events_total: 0,
    providers_detected: 0,
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.firmId) return;
    try {
      const [matterRes, runsRes, docsRes] = await Promise.all([
        fetch(`/api/citeline/matters/${caseId}`),
        fetch(`/api/citeline/matters/${caseId}/runs`),
        fetch(`/api/citeline/matters/${caseId}/documents`),
      ]);

      if (matterRes.ok) setMatter(await matterRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
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
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`/api/citeline/matters/${caseId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        toast.error(parseApiError(errorText) || "Upload failed");
        return;
      }
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
    if (!latestSuccessRun) {
      toast.error("No successful run yet");
      return;
    }
    window.open(`/api/citeline/runs/${latestSuccessRun.id}/artifacts/${type}`, "_blank");
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

  if (loading) return <div className="flex h-[60vh] items-center justify-center">Loading matter...</div>;
  if (!matter) return <div className="py-20 text-center">Matter not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/cases">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl">{matter.title}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(matter.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-background/75 p-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Pages</p>
          <p className="mt-1 text-2xl font-semibold">{Number(metrics.pages_total || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Events</p>
          <p className="mt-1 text-2xl font-semibold">{Number(metrics.events_total || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Providers</p>
          <p className="mt-1 text-2xl font-semibold">{Number(metrics.providers_detected || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Ref</p>
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
            <CardTitle className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extraction run is active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeRunStale && (
              <div className="mb-2 text-xs text-destructive">
                This run appears stalled. You can cancel and retry.
              </div>
            )}
            <div className="grid gap-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:grid-cols-4">
              <span className="rounded-md bg-background/80 px-2 py-1 text-primary">Done: OCR</span>
              <span className="rounded-md bg-background/80 px-2 py-1 text-primary">Active: Mapping</span>
              <span className="rounded-md bg-background/80 px-2 py-1">Next: Gap Analysis</span>
              <span className="rounded-md bg-background/80 px-2 py-1">Next: Export</span>
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => handleCancelRun(activeRun.id)}>
                Cancel Run
              </Button>
              <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleForceFail(activeRun.id)}>
                Force Fail
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Source Documents</CardTitle>
              <CardDescription>All uploaded packet files.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No documents uploaded.</TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.filename}</TableCell>
                        <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{(doc.bytes / 1024 / 1024).toFixed(2)} MB</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Run History</CardTitle>
              <CardDescription>Latest processing activity for this matter.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No runs yet.</TableCell>
                    </TableRow>
                  ) : (
                    runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="break-all">{run.id}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard("Run ID", run.id)}
                            >
                              Copy
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={run.status === "success" ? "default" : "secondary"}>{run.status}</Badge></TableCell>
                        <TableCell>{run.started_at ? new Date(run.started_at).toLocaleString() : "Pending"}</TableCell>
                        <TableCell className="text-right">
                          {run.status === "success" ? (
                            <Button size="sm" variant="outline" asChild>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => handleDownload("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                Chronology PDF
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => handleDownload("specials_summary_pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                Specials Summary
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => handleDownload("missing_records_csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Missing Records CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
              <Button className="w-full" variant="secondary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
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
              <Button className="w-full text-destructive hover:bg-destructive/10" variant="outline" disabled={deleting} onClick={handleDelete}>
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
