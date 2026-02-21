"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Download, ExternalLink, FileText, Loader2, Search, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

export default function AllCasesPage() {
  const { data: session } = useSession();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchMatters = useCallback(async () => {
    if (!session?.user?.firmId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/citeline/firms/${session.user.firmId}/matters`, {
        cache: "no-store",
      });
      if (res.ok) {
        setMatters(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.firmId]);

  useEffect(() => {
    void fetchMatters();
  }, [fetchMatters]);

  async function handleDelete(caseId: string) {
    if (!confirm("Archive this matter?")) return;
    try {
      const res = await fetch(`/api/citeline/matters/${caseId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Matter archived");
        setMatters((prev) => prev.filter((m) => m.id !== caseId));
      } else {
        toast.error("Archive failed");
      }
    } catch {
      toast.error("Archive failed");
    }
  }

  const rows = useMemo(() => {
    const filtered = matters.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return filtered;
  }, [matters, search, sortBy]);

  return (
    <div className="space-y-6">
      <section className="legal-glass rounded-3xl border-0 p-6">
        <h1 className="text-3xl">All Matters</h1>
        <p className="mt-2 text-sm text-muted-foreground">Search and manage every case in your litigation workspace.</p>
      </section>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search matters..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="za">Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/8">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-6">Matter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-5 w-5" />
                    No matters found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <Link href={`/app/cases/${m.id}`} className="font-medium text-primary hover:underline">
                        {m.title}
                      </Link>
                      <p className="font-mono text-[10px] text-muted-foreground">REF: {m.id.substring(0, 8).toUpperCase()}</p>
                    </TableCell>
                    <TableCell><Badge>Ready</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Matter Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/app/cases/${m.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Matter
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/cases/${m.id}/review`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Audit Mode
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/api/citeline/runs/latest/artifacts/pdf?matterId=${m.id}`, "_blank")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Chronology
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive Matter
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

