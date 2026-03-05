"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { use } from "react";
import { Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EvidenceSnippet = { type: string; url: string; snippet: string };
type SignalFlags = Record<string, boolean | number>;
type SniperResult = {
  total_score: number;
  fit_score: number;
  size_score: number;
  lii_score: number;
  marketing_score: number;
  reachability_score: number;
  penalties: number;
  gate_passed: boolean;
  reasons: string[];
  checks?: Record<string, boolean>;
};
type Signals = {
  sources?: Array<{ source: string; url: string; captured_at: string }>;
  web?: { title: string; meta: string; headings: string[]; enriched: boolean; enriched_at: string };
  evidence?: EvidenceSnippet[];
  flags?: SignalFlags;
  sniper?: SniperResult;
};
type Account = {
  id: string;
  name: string;
  website: string | null;
  domain: string | null;
  city: string | null;
  state: string | null;
  icp_score: number | null;
  status: string;
  signals: Signals;
  updated_at: string;
};
type Contact = {
  id: string;
  name: string | null;
  role: string | null;
  email: string | null;
  email_confidence: number;
  status: string;
};

const CONFIDENCE_LABEL: Record<number, string> = {
  100: "Found on site",
  50: "Role guess (MX ok)",
  0: "Unknown",
};

const GATE_LABELS: Record<string, string> = {
  not_defense: "Not defense firm",
  reachability_minimum: "Has contact email",
  size_acceptable: "Acceptable firm size",
  lii_threshold: "LII ≥ 30",
  marketing_maturity: "Marketing maturity ≥ 2",
};

const STATUS_COLORS: Record<string, string> = {
  qualified: "bg-green-100 text-green-800",
  secondary_queue: "bg-blue-100 text-blue-800",
  disqualified: "bg-red-100 text-red-800",
  needs_manual_research: "bg-yellow-100 text-yellow-800",
};

export default function FirmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lead-engine/accounts/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
        setContacts(data.contacts);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, id]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  async function updateStatus(newStatus: string, disqual_reason?: string) {
    if (!account) return;
    setActionLoading(true);
    try {
      await fetch(`/api/lead-engine/accounts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, disqual_reason }),
      });
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6 text-center text-muted-foreground">Account not found.</div>
    );
  }

  const signals = account.signals || {};
  const sniper = signals.sniper;
  const evidence = signals.evidence || [];
  const flags = signals.flags || {};

  return (
    <div className="relative space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="px-0 h-auto">
              <Link href="/app/lead-engine/queue" className="text-muted-foreground text-xs">
                ← Lead Queue
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold truncate">{account.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {account.domain && (
              <a
                href={`https://${account.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {account.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {account.city && (
              <span className="text-sm text-muted-foreground">
                {account.city}, {account.state}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{account.icp_score ?? "—"}</div>
            <div className="text-xs text-muted-foreground">ICP Score</div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              STATUS_COLORS[account.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {account.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {account.status === "secondary_queue" && (
          <Button
            size="sm"
            onClick={() => updateStatus("qualified")}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve for Outreach"}
          </Button>
        )}
        {account.status !== "disqualified" && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => updateStatus("disqualified", "manual_review")}
            disabled={actionLoading}
          >
            Disqualify
          </Button>
        )}
        {account.status !== "paused" && account.status === "active_outreach" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus("paused")}
            disabled={actionLoading}
          >
            Pause Outreach
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sniper Gate Breakdown */}
        {sniper && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Sniper Gate v2
                {sniper.gate_passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <ScoreChip label="Fit" value={sniper.fit_score} max={35} />
                <ScoreChip label="Size" value={sniper.size_score} max={20} signed />
                <ScoreChip label="LII" value={sniper.lii_score} max={60} />
                <ScoreChip label="Marketing" value={sniper.marketing_score} max={3} />
                <ScoreChip label="Reach" value={sniper.reachability_score} max={20} />
                {sniper.penalties !== 0 && (
                  <ScoreChip label="Penalties" value={sniper.penalties} max={0} signed />
                )}
              </div>

              {/* Gate checks */}
              {sniper.checks && (
                <div className="space-y-1.5 pt-2 border-t">
                  {Object.entries(sniper.checks).map(([key, passed]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {passed ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                      <span className={passed ? "" : "text-red-600 font-medium"}>
                        {GATE_LABELS[key] || key}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {sniper.reasons.length > 0 && (
                <div className="text-xs text-red-600 pt-1">
                  {sniper.reasons.join(" · ")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Signal flags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detected Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "practice_pi", label: "PI" },
                { key: "practice_medmal", label: "Med-Mal" },
                { key: "catastrophic_language", label: "Catastrophic" },
                { key: "verdict_page", label: "Verdicts Page" },
                { key: "large_dollar_verdict", label: "Large Verdicts" },
                { key: "chat_widget", label: "Chat Widget" },
                { key: "free_consultation", label: "Free Consult" },
                { key: "contingency_language", label: "Contingency" },
                { key: "defense_language", label: "⚠ Defense" },
              ].map(({ key, label }) =>
                flags[key] ? (
                  <Badge
                    key={key}
                    variant={key === "defense_language" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ) : null
              )}
              {(flags.attorney_count_proxy as number) > 0 && (
                <Badge variant="outline" className="text-xs">
                  {flags.attorney_count_proxy} attorneys
                </Badge>
              )}
              {(flags.review_count as number) > 0 && (
                <Badge variant="outline" className="text-xs">
                  ★ {flags.review_count} reviews
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence snippets */}
      {evidence.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Why this firm was picked ({evidence.length} signals)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evidence.map((e, i) => (
              <div key={i} className="border rounded-md p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{e.type}</Badge>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                  >
                    {e.url.replace(/^https?:\/\//, "").slice(0, 60)}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground italic">"{e.snippet}"</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contacts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts found.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{c.email || "—"}</div>
                    {(c.name || c.role) && (
                      <div className="text-xs text-muted-foreground">
                        {[c.name, c.role].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <Badge
                      variant={c.email_confidence === 100 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {CONFIDENCE_LABEL[c.email_confidence] || `${c.email_confidence}%`}
                    </Badge>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        c.status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : c.status === "replied"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Web signals */}
      {signals.web?.enriched && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Website Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {signals.web.title && (
              <div>
                <span className="text-xs text-muted-foreground">Title</span>
                <p className="font-medium">{signals.web.title}</p>
              </div>
            )}
            {signals.web.meta && (
              <div>
                <span className="text-xs text-muted-foreground">Meta</span>
                <p className="text-sm text-muted-foreground">{signals.web.meta}</p>
              </div>
            )}
            {signals.web.headings?.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Headings</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {signals.web.headings.slice(0, 6).map((h, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreChip({
  label, value, max, signed,
}: {
  label: string;
  value: number;
  max: number;
  signed?: boolean;
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  return (
    <div className="border rounded p-2 text-center">
      <div
        className={`text-base font-bold tabular-nums ${
          signed && isNegative ? "text-red-600" : signed && isPositive ? "text-green-600" : ""
        }`}
      >
        {signed && isPositive ? "+" : ""}{value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {max > 0 && <div className="text-xs text-muted-foreground">/{max}</div>}
    </div>
  );
}
