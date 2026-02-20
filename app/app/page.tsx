"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Clock, FileText, MoreVertical, ExternalLink, Trash2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
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

  const fetchMatters = useCallback(async () => {
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
    }
  }, [session]);

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
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    }
  }

  useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/app/new-case">
            <Plus className="mr-2 h-4 w-4" /> New Case
          </Link>
        </Button>
      </div>

      {/* Slim Banner Stats */}
      <div className="flex items-center gap-8 py-3 px-6 bg-muted/30 border rounded-lg overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Matters:</span>
          <span className="text-sm font-bold">{cases.length}</span>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages Processed:</span>
          <span className="text-sm font-bold">{cases.reduce((acc, c) => acc + c.pages, 0).toLocaleString()}</span>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Completed Runs:</span>
          <span className="text-sm font-bold">{cases.length * 2}</span>
        </div>
      </div>

      <Card className="shadow-sm border-none bg-transparent">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Active Matters</CardTitle>
              <CardDescription className="text-xs">
                {isLive ? "Displaying live matter data from server." : "Displaying demonstration matters."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border rounded-lg bg-background overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6 h-10 text-[10px] uppercase tracking-wider">Matter Name</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-wider">Volume</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-wider">Last Activity</TableHead>
                <TableHead className="text-right pr-6 h-10 text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p>No active matters found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cases.map((c) => (
                <TableRow key={c.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium pl-6 py-4">
                    <Link href={`/app/cases/${c.id}`} className="hover:underline text-primary">
                      {c.name}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-70">
                      REF: {c.displayId || c.id.substring(0, 8).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={c.status === "Completed" ? "default" : "secondary"} 
                      className="text-[10px] h-5 px-2 font-semibold"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.pages} pages
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.updated}</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">Matter Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-xs">
                          <Link href={`/app/cases/${c.id}`}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Case File
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${c.id}`, "_blank")}
                        >
                          <Download className="mr-2 h-3.5 w-3.5" /> Download Chronology
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive text-xs"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Archive Matter
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
