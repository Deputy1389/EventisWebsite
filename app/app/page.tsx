"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Loader2,
  Plus,
  Scale,
  Sparkles,
  Timer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Matter = {
  id: string;
  title: string;
  created_at: string;
};

type FocusMatter = {
  id: string;
  title: string;
  createdAt: string;
  ref: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [matters, setMatters] = useState<FocusMatter[]>([]);

  const fetchMatters = useCallback(async () => {
    if (!session?.user?.id) return; // Must be authenticated

    setLoading(true);
    try {
      // Fetch firm from API if not in session
      let firmId = session?.user?.firmId;
      if (!firmId) {
        const firmsRes = await fetch("/api/citeline/firms", { cache: "no-store" });
        if (!firmsRes.ok) return;
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) return;
        firmId = firms[0].id;
      }

      const res = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const payload: Matter[] = await res.json();
      const mapped = payload
        .map((m) => ({
          id: m.id,
          title: m.title,
          createdAt: new Date(m.created_at).toLocaleDateString(),
          ref: m.id.slice(0, 8).toUpperCase(),
        }))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setMatters(mapped);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.firmId]);

  useEffect(() => {
    void fetchMatters();
  }, [fetchMatters]);

  const focusQueue = useMemo(() => matters.slice(0, 4), [matters]);

  const stats = useMemo(
    () => ({
      total: matters.length,
      reviewReady: matters.length,
      recent: focusQueue.length,
    }),
    [matters.length, focusQueue.length],
  );

  return (
    <div className="relative space-y-6">
      <section className="rounded-2xl border border-border-dark bg-surface-dark p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Dashboard</p>
            <h1 className="mt-1 text-3xl text-white">Matter Command Center</h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitor case health, identify defense risks, and verify clinical citations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link href="/app/new-case">
                <Plus className="mr-2 h-4 w-4" />
                Start New Matter
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border-dark hover:bg-white/5">
              <Link href="/app/cases">Open Matter List</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-dark bg-surface-dark">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active Docket</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border-dark bg-surface-dark">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Audit Pending</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.reviewReady}</p>
          </CardContent>
        </Card>
        <Card className="border-border-dark bg-surface-dark">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.recent}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border-dark bg-surface-dark">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-white">Recent Matters</CardTitle>
            <Link href="/app/cases" className="text-sm text-primary hover:underline">
              View all matters
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="py-10 text-center text-slate-500">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </div>
            )}
            {!loading && focusQueue.length === 0 && (
              <div className="rounded-xl border border-dashed border-border-dark p-6 text-center text-slate-500">
                <Sparkles className="mx-auto mb-2 h-4 w-4" />
                No matters yet. Start your first upload.
              </div>
            )}
            {!loading &&
              focusQueue.map((m) => (
                <div key={m.id} className="group flex items-center justify-between rounded-xl border border-border-dark bg-background-dark p-4 hover:border-primary/40 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center border border-border-dark group-hover:border-primary/30 transition-colors">
                       <Scale className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-primary transition-colors">{m.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-500 border-border-dark px-1.5">{m.ref}</Badge>
                        <span className="text-[10px] text-slate-500">Created {m.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                      <Link href={`/app/cases/${m.id}`}>Details</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-primary hover:bg-blue-600 shadow-sm px-4">
                      <Link href={`/app/cases/${m.id}/review`}>Open Audit</Link>
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="border-border-dark bg-surface-dark">
          <CardHeader>
            <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link href="/app/new-case">
                <Plus className="mr-2 h-4 w-4" />
                Create New Matter
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link href="/app/cases">
                <FileText className="mr-2 h-4 w-4" />
                Browse Matter Registry
              </Link>
            </Button>
            <div className="rounded-xl border border-border-dark bg-background-dark p-3 text-xs">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Timer className="h-4 w-4 text-primary" />
                Typical Turnaround
              </div>
              <Badge variant="outline" className="border-border-dark text-slate-400">5 to 30 minutes per matter</Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
