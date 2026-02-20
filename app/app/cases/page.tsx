"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search, FileText, ExternalLink, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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

export default function AllCasesPage() {
  const { data: session } = useSession();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMatters = useCallback(async () => {
    if (!session?.user?.firmId) return;
    try {
      const res = await fetch(`/api/citeline/firms/${session.user.firmId}/matters`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: Matter[] = await res.json();
        setMatters(data);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  async function handleDelete(caseId: string) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Case deleted successfully");
        setMatters((prev) => prev.filter((m) => m.id !== caseId));
      } else {
        toast.error("Failed to delete case");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    }
  }

  const filteredMatters = matters.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Cases</h1>
          <p className="text-muted-foreground">Manage and view all your active medical chronologies.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Loading cases...</TableCell>
                </TableRow>
              ) : filteredMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No cases found.</TableCell>
                </TableRow>
              ) : filteredMatters.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Link href={`/app/cases/${m.id}`} className="hover:underline">
                        {m.title}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">{m.id.substring(0, 8).toUpperCase()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge>Completed</Badge>
                  </TableCell>
                  <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
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
                          <Link href={`/app/cases/${m.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Open Case
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${m.id}`, "_blank")}>
                          <Download className="mr-2 h-4 w-4" /> Latest Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(m.id)}
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
