"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchMatters() {
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
    }
    fetchMatters();
  }, [session]);

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
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
