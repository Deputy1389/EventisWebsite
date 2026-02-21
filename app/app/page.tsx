"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Download, ExternalLink, FileText, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

type Case = {
  id: string;
  displayId: string;
  name: string;
  status: "Ready";
  updated: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatters = useCallback(async () => {
    const firmId = session?.user?.firmId;
    if (!firmId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        cache: "no-store",
      });
      if (res.ok) {
        const matters: Matter[] = await res.json();
        setCases(
          matters.map((m) => ({
            id: m.id,
            displayId: m.id.substring(0, 8).toUpperCase(),
            name: m.title,
            status: "Ready",
            updated: new Date(m.created_at).toLocaleDateString(),
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.firmId]);

  useEffect(() => {
    void fetchMatters();
  }, [fetchMatters]);

  async function handleDelete(caseId: string) {
    if (!confirm("Archive this case?")) return;
    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Case archived");
        setCases((prev) => prev.filter((c) => c.id !== caseId));
      } else {
        toast.error("Archive failed");
      }
    } catch {
      toast.error("Archive failed");
    }
  }

  const stats = useMemo(
    () => ({
      matters: cases.length,
      monthOutput: cases.length * 3,
      reviewReady: cases.length,
    }),
    [cases.length],
  );

  return (
    <div className="relative space-y-6">
      <section className="legal-glass rounded-3xl border-0 p-6 shadow-xl shadow-primary/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Command Center</p>
            <h1 className="mt-1 text-3xl">Welcome back, {session?.user?.name || "Counsel"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review active matters, open Audit Mode, and ship court-ready outputs without leaving this workspace.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/app/new-case">
              <Plus className="mr-2 h-4 w-4" />
              Start New Matter
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg shadow-primary/8">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Matters</p>
            <p className="mt-2 text-3xl font-semibold">{stats.matters}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-primary/8">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Exports This Month</p>
            <p className="mt-2 text-3xl font-semibold">{stats.monthOutput}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-primary/8">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Audit-Ready Matters</p>
            <p className="mt-2 text-3xl font-semibold">{stats.reviewReady}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-xl shadow-primary/8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Matters</CardTitle>
          <Link href="/app/cases" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-6">Matter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    <Sparkles className="mx-auto mb-2 h-5 w-5" />
                    No matters yet.
                  </TableCell>
                </TableRow>
              ) : (
                cases.slice(0, 8).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6">
                      <Link href={`/app/cases/${c.id}`} className="font-medium text-primary hover:underline">
                        {c.name}
                      </Link>
                      <p className="font-mono text-[10px] text-muted-foreground">REF: {c.displayId}</p>
                    </TableCell>
                    <TableCell>
                      <Badge>Ready</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.updated}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Case Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/app/cases/${c.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Matter
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/cases/${c.id}/review`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Audit Mode
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${c.id}`, "_blank")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Chronology
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

