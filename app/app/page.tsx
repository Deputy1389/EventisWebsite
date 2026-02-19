import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Clock, FileText, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/citeline";
import { withServerAuthHeaders } from "@/lib/citeline-server";

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

const mockCases = [
  { id: "CAS-24-101", name: "Smith v. State Farm", status: "Completed", updated: "2 mins ago", pages: 450 },
  { id: "CAS-24-102", name: "Doe v. Mercy Hospital", status: "Processing", updated: "15 mins ago", pages: 1200 },
  { id: "CAS-24-103", name: "Johnson MVA", status: "Needs Review", updated: "1 hour ago", pages: 85 },
];

export default async function DashboardPage() {
  const session = await auth();
  const firmId = session?.user?.firmId;
  const apiUrl = getServerApiUrl();

  let cases = mockCases;
  let isLive = false;

  if (firmId) {
    try {
      const res = await fetch(`${apiUrl}/firms/${firmId}/matters`, {
        cache: "no-store",
        headers: withServerAuthHeaders(undefined, {
          userId: session?.user?.id,
          firmId,
        }, "GET", `/firms/${firmId}/matters`),
      });
      if (res.ok) {
        const matters: Matter[] = await res.json();
        cases = matters.map((m) => ({
          id: m.id.substring(0, 8).toUpperCase(),
          name: m.title,
          status: "Completed",
          updated: new Date(m.created_at).toLocaleDateString(),
          pages: Math.floor(Math.random() * 500) + 50,
        }));
        isLive = true;
      }
    } catch (error) {
      console.error("Failed to fetch matters from Citeline:", error);
    }
  }

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
                    <Link href="#" className="hover:underline">{c.name}</Link>
                    <div className="text-xs text-muted-foreground">{c.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Completed" ? "default" : c.status === "Processing" ? "secondary" : "destructive"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.pages}</TableCell>
                  <TableCell>{c.updated}</TableCell>
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
