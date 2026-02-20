"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search, FileText, ExternalLink, Trash2, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [sortBy, setSortBy] = useState("newest");

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

  const sortedAndFilteredMatters = useMemo(() => {
    const result = matters.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [matters, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Cases</h1>
          <p className="text-muted-foreground">Manage and view all your active medical chronologies.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="az">Name (A-Z)</SelectItem>
            <SelectItem value="za">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-none bg-transparent">
        <CardContent className="p-0 border rounded-lg bg-background overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6 h-10 text-[10px] uppercase tracking-wider">Case Name</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-10 text-[10px] uppercase tracking-wider">Created At</TableHead>
                <TableHead className="text-right pr-6 h-10 text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground tracking-tight">Accessing records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p>No cases found matching your search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedAndFilteredMatters.map((m) => (
                <TableRow key={m.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium pl-6 py-4">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground opacity-50" />
                      <Link href={`/app/cases/${m.id}`} className="hover:underline text-primary">
                        {m.title}
                      </Link>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 ml-6 opacity-70">
                      REF: {m.id.substring(0, 8).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] h-5 px-2 font-semibold">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">Case Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-xs">
                          <Link href={`/app/cases/${m.id}`}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Full File
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${m.id}`, "_blank")}
                        >
                          <Download className="mr-2 h-3.5 w-3.5" /> Download Chronology
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive text-xs"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Archive Case
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
