"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";

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

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { data: session } = useSession();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const latestSuccessRun = runs.find(r => r.status === "success");

  useEffect(() => {
    async function fetchData() {
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
      } catch (err) {
        console.error("Failed to fetch case data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [session, caseId]);

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
        <Card className="md:col-span-2">
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
                        <Button size="sm" variant="outline">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                asChild
                disabled={!latestSuccessRun}
              >
                <Link href={latestSuccessRun ? `/api/citeline/runs/${latestSuccessRun.id}/artifacts/json` : "#"} target="_blank">
                  <FileText className="mr-2 h-4 w-4" /> Medical Chronology (JSON)
                </Link>
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                asChild
                disabled={!latestSuccessRun}
              >
                <Link href={latestSuccessRun ? `/api/citeline/runs/${latestSuccessRun.id}/artifacts/csv` : "#"} target="_blank">
                  <FileText className="mr-2 h-4 w-4" /> Provider List (CSV)
                </Link>
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                asChild
                disabled={!latestSuccessRun}
              >
                <Link href={latestSuccessRun ? `/api/citeline/runs/${latestSuccessRun.id}/artifacts/json` : "#"} target="_blank">
                  <FileText className="mr-2 h-4 w-4" /> Missing Records (JSON)
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="secondary">
                Upload More Documents
              </Button>
              <Button className="w-full">
                Trigger New Extraction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
