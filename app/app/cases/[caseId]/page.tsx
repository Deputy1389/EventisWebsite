"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ChevronLeft, Upload, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Run = {
  id: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  metrics?: {
    pages_total?: number;
    events_total?: number;
    providers_detected?: number;
    [key: string]: number | string | boolean | undefined | null | object;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestSuccessRun = runs.find(r => r.status === "success");
  const activeRun = runs.find(r => r.status === "pending" || r.status === "running");

  const metrics = latestSuccessRun?.metrics || {
    pages_total: documents.reduce((acc, d) => acc + (d.page_count || 0), 0) || 0,
    events_total: 0,
    providers_detected: 0
  };

  const fetchData = useCallback(async () => {
    if (!session?.user?.firmId) return;
    try {
      // Fetch Matter Details
      const matterRes = await fetch(`/api/citeline/matters/${caseId}`);
      if (matterRes.ok) {
        setMatter(await matterRes.json());
      }

      // Fetch Runs for this Matter
      const runsRes = await fetch(`/api/citeline/matters/${caseId}/runs`);
      if (runsRes.ok) {
        setRuns(await runsRes.json());
      }

      // Fetch Documents
      const docsRes = await fetch(`/api/citeline/matters/${caseId}/documents`);
      if (docsRes.ok) {
        setDocuments(await docsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch case data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session, caseId]);

  function handleDownload(type: string) {
    if (!latestSuccessRun) {
      toast.error("No successful extraction run found. Please wait for processing to complete.");
      return;
    }
    const url = `/api/citeline/runs/${latestSuccessRun.id}/artifacts/${type}`;
    console.log(`Downloading ${type} from ${url}`);
    window.open(url, "_blank");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Case deleted successfully");
        router.push("/app/cases");
      } else {
        toast.error("Failed to delete case");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/citeline/matters/${caseId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully! Starting extraction...");
        
        // Trigger extraction run
        await fetch(`/api/citeline/matters/${caseId}/runs`, {
          method: "POST",
          body: JSON.stringify({}),
        });

        // Refresh runs
        fetchData();
        router.push(`/app/cases/${caseId}/review`);
      } else {
        toast.error("Failed to upload document.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Poll for updates if there are active runs
    const interval = setInterval(() => {
      const hasActiveRuns = runs.some(r => r.status === "pending" || r.status === "running");
      if (hasActiveRuns || runs.length === 0) {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData, runs]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]">Loading case details...</div>;
  }

  if (!matter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Case not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/app/cases">Back to All Cases</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/cases">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{matter.title}</h1>
          <p className="text-muted-foreground text-sm">Created on {new Date(matter.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Case Vitals Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 border rounded-xl">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volume</p>
          <p className="text-xl font-bold">{metrics.pages_total || documents.length} <span className="text-xs font-normal text-muted-foreground">Pages</span></p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Evidence</p>
          <p className="text-xl font-bold">{metrics.events_total || 0} <span className="text-xs font-normal text-muted-foreground">Events</span></p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Providers</p>
          <p className="text-xl font-bold">{metrics.providers_detected || 0} <span className="text-xs font-normal text-muted-foreground">Entities</span></p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ref ID</p>
          <p className="text-sm font-mono mt-1 opacity-70">{caseId.substring(0, 12).toUpperCase()}</p>
        </div>
      </div>

      {activeRun && (
        <Card className="border-primary/20 bg-primary/5 animate-pulse">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Active Extraction in Progress...
              </CardTitle>
              <Badge variant="outline" className="bg-background">Step 2 of 4</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex gap-8 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              <span className="text-primary">âœ“ OCR Processing</span>
              <span className="text-primary animate-bounce">â–¶ Ontology Mapping</span>
              <span>â—‹ Gap Detection</span>
              <span>â—‹ Final Export</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Documents</CardTitle>
              <CardDescription>Files uploaded for this matter.</CardDescription>
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
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No documents uploaded.</TableCell>
                    </TableRow>
                  ) : documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {doc.filename}
                      </TableCell>
                      <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{(doc.bytes / 1024 / 1024).toFixed(2)} MB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing History</CardTitle>
            <CardDescription>All extractions performed for this matter.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No runs yet.</TableCell>
                  </TableRow>
                ) : runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-xs">{run.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <Badge variant={run.status === "success" ? "default" : "secondary"}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {run.started_at ? new Date(run.started_at).toLocaleString() : "Pending"}
                    </TableCell>
                    <TableCell className="text-right">
                      {run.status === "success" ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          asChild
                        >
                          <Link href={`/app/cases/${caseId}/review`}>
                            View Results
                          </Link>
                        </Button>
                      ) : (
                        <Clock className="h-4 w-4 ml-auto text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => handleDownload("pdf")}
              >
                <FileText className="mr-2 h-4 w-4" /> Medical Chronology (PDF)
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => handleDownload("specials_summary_pdf")}
              >
                <FileText className="mr-2 h-4 w-4" /> Specials Summary (PDF)
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => handleDownload("missing_records_csv")}
              >
                <FileText className="mr-2 h-4 w-4" /> Missing Records (CSV)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <Button 
                className="w-full" 
                variant="secondary"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload More Documents</>
                )}
              </Button>
              <Button 
                className="w-full text-destructive hover:bg-destructive/10" 
                variant="outline"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="mr-2 h-4 w-4" /> Delete Case</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
