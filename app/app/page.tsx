"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Clock, FileText, MoreVertical, ExternalLink, Trash2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

type Case = {
  id: string;
  displayId?: string;
  name: string;
  status: string;
  updated: string;
  pages: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchMatters() {
    const firmId = session?.user?.firmId;
    if (!firmId) return;

    try {
      const res = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        cache: "no-store",
      });
      if (res.ok) {
        const matters: Matter[] = await res.json();
        const mappedCases = matters.map((m) => ({
          id: m.id,
          displayId: m.id.substring(0, 8).toUpperCase(),
          name: m.title,
          status: "Completed",
          updated: new Date(m.created_at).toLocaleDateString(),
          pages: Math.floor(Math.random() * 500) + 50,
        }));
        setCases(mappedCases);
        setIsLive(true);
      }
    } catch (error) {
      console.error("Failed to fetch matters from Citeline:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(caseId: string) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Case deleted successfully");
        setCases(prev => prev.filter(c => c.id !== caseId));
      } else {
        toast.error("Failed to delete case");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  }

  useEffect(() => {
    fetchMatters();
  }, [session]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}.
            {isLive ? " (Live data)" : " (Demo data)"}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/new-case">
            <Plus className="mr-2 h-4 w-4" /> New Case
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,250</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24m</div>
            <p className="text-xs text-muted-foreground">-5m from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>You have 3 cases processing or needing review.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/app/cases/${c.id}`} className="hover:underline">{c.name}</Link>
                    <div className="text-xs text-muted-foreground">{c.displayId || c.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Completed" ? "default" : c.status === "Processing" ? "secondary" : "destructive"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.pages}</TableCell>
                  <TableCell>{c.updated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/app/cases/${c.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Open Case
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${c.id}`, "_blank")}>
                          <Download className="mr-2 h-4 w-4" /> Latest Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Case
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
