"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Plus, ShieldAlert, Share2, Users, Receipt, Activity, RotateCcw, Trash2, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "next-themes";
import { terms } from "@/lib/terms";

const navItems = [
  { href: "/app/cases", label: "All Matters", icon: "folder_open" },
  { href: "/app/chronologies", label: "Chronologies", icon: "ecg_heart" },
  { href: "/app/expert-reports", label: "Expert Reports", icon: "gavel" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [minConfidence, setMinConfidence] = useState(85);
  const [relCertainty, setRelCertainty] = useState(92);

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "JD";

  return (
    <div className="flex min-h-screen bg-background-dark text-slate-200">
      {/* Left Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-border-dark bg-surface-dark flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border-dark">
          <Link href="/app/cases" className="flex items-center gap-2">
            <div className="size-7 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <span className="text-white font-semibold text-sm">{terms.marketing.productName}</span>
          </Link>
        </div>

        {/* New Matter Button */}
        <div className="p-3 border-b border-border-dark">
          <Link
            href="/app/new-case"
            className="h-9 w-full bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Matter
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
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

        {/* Bottom: Stats + User */}
        <div className="p-3 border-t border-border-dark space-y-3">
          {/* User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {userInitials}
              </div>
              <span className="text-xs text-slate-400">{session?.user?.name?.split(" ")[0] || "User"}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-slate-500 hover:text-white rounded transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 text-slate-500 hover:text-white rounded transition-colors"
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </header>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Extraction Thresholds</h3>
                <p className="text-sm text-slate-500 mt-1">Minimum probability score for clinical entity extraction.</p>
              </div>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-center">
              <ShieldAlert className="text-yellow-500 shrink-0" size={20} />
              <p className="text-xs font-medium text-yellow-200/80">
                Lowering thresholds may allow unverified entities into export. Standard baseline is 85%.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ThresholdCard 
                label="Minimum Entity Confidence" 
                value={minConfidence} 
                onChange={setMinConfidence} 
              />
              <ThresholdCard 
                label="Relationship Certainty" 
                value={relCertainty} 
                onChange={setRelCertainty} 
              />
            </div>
          </section>

          <section className="mt-10 bg-surface-dark border border-border-dark rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Validation Logic</h3>
              <p className="text-sm text-slate-500 mt-1">Automated integrity gates before chronology export.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ToggleSetting title="Temporal Consistency" sub="Flag pre-DOB or impossible dates" checked />
              <ToggleSetting title="Dosage Outliers" sub="Flag deviations exceeding 2σ" checked />
              <ToggleSetting title="ICD-10 Mismatch" sub="Cross-reference with diagnosis codes" />
              <ToggleSetting title="Provider Credentialing" sub="Verify NPI status" checked />
            </div>
          </section>

          <section className="mt-6 bg-surface-dark border border-border-dark rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Excluded Providers</h3>
                <p className="text-sm text-slate-500 mt-1">Filtered from all exports.</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-medium text-primary hover:text-blue-400 transition-colors">
                <Plus size={16} /> Add Provider
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border-dark">
              <table className="w-full text-left">
                <thead className="bg-background-dark/50 text-[10px] font-medium uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark text-sm">
                  <tr className="bg-surface-dark/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">Dr. Sarah Johnson</div>
                      <div className="text-[10px] text-slate-600">NPI: 1928374650</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-medium">Conflict Filter</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-slate-600 hover:text-danger transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex justify-end gap-3 mt-8">
            <button className="px-6 h-10 rounded-lg border border-border-dark text-slate-400 font-medium text-sm hover:bg-white/5">Discard</button>
            <button className="px-8 h-10 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium text-sm">Save</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ThresholdCard({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="p-5 rounded-xl bg-surface-dark border border-border-dark space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <span className="text-lg font-mono font-bold text-white">{value}%</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary bg-background-dark h-1.5 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}

function ToggleSetting({ title, sub, checked = false }: { title: string, sub: string, checked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border-dark bg-background-dark/30 hover:bg-background-dark/50 transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="text-xs text-slate-500">{sub}</span>
      </div>
      <div className={`w-9 h-5 rounded-full p-0.5 transition-all ${checked ? 'bg-primary' : 'bg-slate-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
