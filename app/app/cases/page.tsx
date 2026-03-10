"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";

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
        setMatters(data);
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
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "az") return a.title.localeCompare(b.title);
      return 0;
    });
    return filtered;
  }, [matters, search, sortBy]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)]">
      {/* Top Bar */}
      <header className="flex items-center justify-between pb-4 border-b border-border-dark mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">All Matters</h2>
          <span className="text-xs text-slate-500">({filteredMatters.length})</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              className="h-8 w-52 bg-background-dark border border-border-dark rounded-lg pl-8 pr-3 text-xs text-white focus:outline-none focus:border-primary/50 placeholder-slate-600"
              placeholder="Search matters..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-36 bg-background-dark border-border-dark text-xs text-slate-400 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-dark border-border-dark text-white">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="az">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">
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
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors mb-1">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Created {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
