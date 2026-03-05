"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Account = {
  id: string;
  name: string;
  domain: string | null;
  city: string | null;
  state: string | null;
  icp_score: number | null;
  status: string;
  updated_at: string;
  sources: Array<{ source: string }> | null;
  attorney_count_proxy: string | null;
  review_count: string | null;
  last_enriched_at: string | null;
};

type ApiResponse = {
  total: number;
  limit: number;
  offset: number;
  accounts: Account[];
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "qualified", label: "Qualified" },
  { value: "secondary_queue", label: "Secondary" },
  { value: "needs_manual_research", label: "Manual Review" },
  { value: "disqualified", label: "Disqualified" },
];

const STATUS_COLORS: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  secondary_queue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  needs_manual_research: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  disqualified: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  new: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const SOURCE_COLORS: Record<string, string> = {
  maps: "bg-blue-100 text-blue-700",
  justia: "bg-purple-100 text-purple-700",
  findlaw: "bg-orange-100 text-orange-700",
};

const LIMIT = 50;

export default function LeadQueuePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [inputQ, setInputQ] = useState("");
  const [offset, setOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/lead-engine/accounts?${params}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status, q, offset]);

  useEffect(() => { void fetchAccounts(); }, [fetchAccounts]);

  async function updateStatus(id: string, newStatus: string, disqual_reason?: string) {
    setActionLoading(id);
    try {
      await fetch(`/api/lead-engine/accounts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, disqual_reason }),
      });
      await fetchAccounts();
    } finally {
      setActionLoading(null);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(inputQ);
    setOffset(0);
  }

  return (
    <div className="relative space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead Queue</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} accounts` : "Loading…"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/lead-engine">← Dashboard</Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setOffset(0); }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <Input
          placeholder="Search name or domain…"
          value={inputQ}
          onChange={(e) => setInputQ(e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.accounts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Score</th>
                    <th className="text-left px-4 py-3 font-medium">Firm</th>
                    <th className="text-left px-4 py-3 font-medium">Location</th>
                    <th className="text-left px-4 py-3 font-medium">Sources</th>
                    <th className="text-left px-4 py-3 font-medium">Size</th>
                    <th className="text-left px-4 py-3 font-medium">Reviews</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 tabular-nums font-medium">
                        {account.icp_score ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/lead-engine/${account.id}`}
                          className="hover:underline font-medium block"
                        >
                          {account.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{account.domain}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {[account.city, account.state].filter(Boolean).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(account.sources || []).map((s, i) => (
                            <span
                              key={i}
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                SOURCE_COLORS[s.source] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {s.source}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums">
                        {account.attorney_count_proxy && parseInt(account.attorney_count_proxy) > 0
                          ? `${account.attorney_count_proxy} atty`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums">
                        {account.review_count && parseInt(account.review_count) > 0
                          ? `★ ${account.review_count}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLORS[account.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {account.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {actionLoading === account.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              {account.status === "secondary_queue" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => updateStatus(account.id, "qualified")}
                                >
                                  Approve
                                </Button>
                              )}
                              {account.status !== "disqualified" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    updateStatus(account.id, "disqualified", "manual_review")
                                  }
                                >
                                  Disqualify
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + LIMIT, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + LIMIT >= data.total}
              onClick={() => setOffset(offset + LIMIT)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
