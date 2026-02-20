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
                          onClick={() => window.open(`/api/citeline/runs/${run.id}/artifacts/json`, "_blank")}
                        >
                          View Results
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
