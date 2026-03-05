"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, TrendingUp, Users, Mail, CheckCircle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Metrics = {
  range: string;
  new_accounts: number;
  enriched: number;
  qualified: number;
  secondary_queue: number;
  emails_found: number;
  email_found_rate: number;
  by_source: { maps: number; justia: number; findlaw: number };
  top_accounts: TopAccount[];
};

type TopAccount = {
  id: string;
  name: string;
  domain: string;
  city: string | null;
  state: string | null;
  icp_score: number | null;
  attorney_count: string | null;
  review_count: string | null;
};

export default function LeadEngineDashboard() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"1d" | "7d">("1d");

  const fetchMetrics = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lead-engine/metrics?range=${range}`, { cache: "no-store" });
      if (res.ok) setMetrics(await res.json());
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, range]);

  useEffect(() => { void fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="relative space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead Engine</h1>
          <p className="text-sm text-muted-foreground">Autonomous PI/med-mal firm discovery</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={range === "1d" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("1d")}
          >
            Today
          </Button>
          <Button
            variant={range === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("7d")}
          >
            7 Days
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/lead-engine/queue">Lead Queue →</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !metrics ? (
        <div className="text-center py-20 text-muted-foreground">
          Failed to load metrics. Check DB connection.
        </div>
      ) : (
        <>
          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricTile
              icon={<Users className="h-4 w-4" />}
              label="New Accounts"
              value={metrics.new_accounts}
            />
            <MetricTile
              icon={<TrendingUp className="h-4 w-4" />}
              label="Enriched"
              value={metrics.enriched}
            />
            <MetricTile
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              label="Qualified (Sniper)"
              value={metrics.qualified}
              highlight
            />
            <MetricTile
              icon={<Clock className="h-4 w-4" />}
              label="Secondary Queue"
              value={metrics.secondary_queue}
            />
          </div>

          {/* Email + source row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.email_found_rate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.emails_found} accounts with contact email
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Source Yield</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SourceBar label="Maps" count={metrics.by_source.maps} total={metrics.new_accounts} />
                <SourceBar label="Justia" count={metrics.by_source.justia} total={metrics.new_accounts} />
                <SourceBar label="FindLaw" count={metrics.by_source.findlaw} total={metrics.new_accounts} />
              </CardContent>
            </Card>
          </div>

          {/* Top 20 sniper accounts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Sniper Accounts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {metrics.top_accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No qualified accounts yet.</p>
              ) : (
                <div className="divide-y">
                  {metrics.top_accounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/app/lead-engine/${account.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{account.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {account.domain} · {account.city}, {account.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        {account.review_count && parseInt(account.review_count) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ★ {account.review_count}
                          </span>
                        )}
                        <Badge variant="secondary" className="tabular-nums">
                          {account.icp_score ?? "—"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricTile({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-green-500/30 bg-green-50/10" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function SourceBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-6 text-right">{count}</span>
    </div>
  );
}
