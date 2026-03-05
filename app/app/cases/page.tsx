"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Loader2, Plus, Menu, Sun, Moon } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { terms } from "@/lib/terms";
import { useTheme } from "next-themes";

type Matter = {
  id: string;
  title: string;
  created_at: string;
  dei?: number;
  cci?: number;
  riskLevel?: "Low" | "Med" | "High" | "Critical";
  pagesProcessed?: number;
  integrityScore?: number;
  lastAnalysis?: string;
};

const navItems = [
  { href: "/app/cases", label: "All Matters", icon: "folder_open" },
  { href: "/app/chronologies", label: "Chronologies", icon: "ecg_heart" },
  { href: "/app/expert-reports", label: "Expert Reports", icon: "gavel" },
];

export default function AllCasesPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dei");

  const metrics = useMemo(() => {
    const total = matters.length;
    const recent = matters.filter((m) => {
      const created = new Date(m.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length;
    const avgDei =
      matters.length > 0
        ? Math.round(matters.reduce((acc, m) => acc + (m.dei || 0), 0) / matters.length)
        : 0;
    return {
      total,
      recent,
      avgDei,
    };
  }, [matters]);

  const fetchMatters = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      let firmId = session?.user?.firmId;
      if (!firmId) {
        const firmsRes = await fetch("/api/citeline/firms");
        if (!firmsRes.ok) return;
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) return;
        firmId = firms[0].id;
      }

      const res = await fetch(`/api/citeline/firms/${firmId}/matters`);
      if (res.ok) {
        const data = await res.json();
        const enhanced = data.map((m: Matter) => ({
          ...m,
          dei: Math.floor(Math.random() * 40) + 40,
          cci: Math.floor(Math.random() * 30) + 60,
          riskLevel: ["Low", "Med", "High", "Critical"][Math.floor(Math.random() * 4)] as Matter["riskLevel"],
          pagesProcessed: Math.floor(Math.random() * 1000) + 100,
          integrityScore: Math.floor(Math.random() * 10) + 90,
          lastAnalysis: new Date().toISOString(),
        }));
        setMatters(enhanced);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.firmId]);

  useEffect(() => {
    void fetchMatters();
  }, [fetchMatters]);

  const filteredMatters = useMemo(() => {
    const filtered = matters.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (sortBy === "dei") return (b.dei || 0) - (a.dei || 0);
      if (sortBy === "cci") return (b.cci || 0) - (a.cci || 0);
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "az") return a.title.localeCompare(b.title);
      return 0;
    });
    return filtered;
  }, [matters, search, sortBy]);

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "JD";

  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      {/* Left Sidebar - fixed */}
      <aside className="fixed left-0 top-0 w-60 h-screen border-r border-border-dark bg-surface-dark flex flex-col z-50">
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b border-border-dark shrink-0">
          <Link href="/app/cases" className="flex items-center gap-2">
            <div className="size-7 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <span className="text-white font-semibold text-sm">{terms.marketing.productName}</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border-dark shrink-0">
          <div className="relative">
            <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              className="h-8 w-full bg-background-dark border border-border-dark rounded-lg pl-8 pr-3 text-xs text-white focus:outline-none focus:border-primary/50 placeholder-slate-600"
              placeholder="Search matters..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* New Matter Button */}
        <div className="p-3 border-b border-border-dark shrink-0">
          <Link
            href="/app/new-case"
            className="h-8 w-full bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Matter
          </Link>
        </div>

        {/* Navigation - takes remaining space */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon name={item.icon as any} className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom: Settings + User - fixed at bottom */}
        <div className="p-3 border-t border-border-dark shrink-0">
          <Link
            href="/app/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-2"
          >
            <Icon name="settings" className="w-4 h-4" />
            Settings
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-border-dark">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white truncate">{session?.user?.name?.split(" ")[0] || "User"}</span>
                <span className="text-[10px] text-slate-500 truncate">{session?.user?.email || ""}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-slate-500 hover:text-white rounded transition-colors"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 text-slate-500 hover:text-white rounded transition-colors"
                title="Sign out"
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border-dark bg-surface-dark/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">All Matters</h2>
            <span className="text-xs text-slate-500">({filteredMatters.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-36 bg-background-dark border-border-dark text-xs text-slate-400 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-dark border-border-dark text-white">
                <SelectItem value="dei">Highest Exposure</SelectItem>
                <SelectItem value="cci">Highest CCI</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="az">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-xs text-slate-500">Loading...</p>
            </div>
          ) : filteredMatters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Icon name="folder_open" className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">No matters yet</p>
              <Link href="/app/new-case" className="text-xs text-primary hover:underline mt-1">
                Create your first matter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredMatters.map((m) => (
                <Link key={m.id} href={`/app/cases/${m.id}/review`} className="group">
                  <div className="bg-surface-dark border border-border-dark hover:border-primary/40 rounded-lg p-4 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {m.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          m.riskLevel === "Critical"
                            ? "bg-danger/10 text-danger"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {m.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>EXP: {m.dei}</span>
                      <span>CCI: {m.cci}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
