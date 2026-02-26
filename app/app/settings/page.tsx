"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Share2, 
  Users, 
  Receipt, 
  Activity, 
  RotateCcw,
  Trash2,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [minConfidence, setMinConfidence] = useState(85);
  const [relCertainty, setRelCertainty] = useState(92);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-8 md:p-12 gap-12 bg-background-dark text-slate-200">
      <header className="mb-12 border-b border-border-dark pb-8">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">System Settings</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">LIT-SUITE CONFIGURATION v2.4</p>
      </header>

      <div className="flex gap-12">
        <aside className="w-64 flex-shrink-0 flex flex-col gap-8">
          <nav className="flex flex-col gap-1">
            <SettingsItem icon={<Activity size={18} />} label="Pipeline Configuration" />
            <SettingsItem icon={<ShieldAlert size={18} />} label="Validation Thresholds" active />
            <SettingsItem icon={<Share2 size={18} />} label="Export Settings" />
            <div className="my-4 border-t border-border-dark"></div>
            <SettingsItem icon={<Users size={18} />} label="Team Access" />
            <SettingsItem icon={<Receipt size={18} />} label="Billing & Usage" />
          </nav>
        </aside>

        <main className="flex-1 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Extraction Thresholds</h3>
                <p className="text-sm text-slate-500 mt-1">Set the minimum probability score for deterministic clinical entity extraction.</p>
              </div>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-center">
              <ShieldAlert className="text-yellow-500 shrink-0" size={20} />
              <p className="text-xs font-bold text-yellow-200/80 uppercase tracking-widest">
                Lowering thresholds may allow unverified entities into export. Standard litigation baseline is 85%.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
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

          <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Validation Logic</h3>
              <p className="text-sm text-slate-500 mt-1">Automated integrity gates enforced before chronology export.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ToggleSetting title="Temporal Consistency" sub="Flag pre-DOB or impossible date sequences" checked />
              <ToggleSetting title="Dosage Outliers" sub="Flag dosage deviations exceeding 2σ from mean" checked />
              <ToggleSetting title="ICD-10 Mismatch" sub="Cross-reference narrative with diagnosis codes" />
              <ToggleSetting title="Provider Credentialing" sub="Verify NPI status for extracted providers" checked />
            </div>
          </section>

          <section className="bg-surface-dark border border-border-dark rounded-2xl p-8 space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Excluded Providers</h3>
                <p className="text-sm text-slate-500 mt-1">Suppressed entities will be programmatically filtered from all exports.</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-blue-400 transition-colors">
                <Plus size={16} /> Add Provider
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border-dark">
              <table className="w-full text-left">
                <thead className="bg-background-dark/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Provider / Entity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark text-sm">
                  <tr className="bg-surface-dark/50 hover:bg-background-dark/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">Dr. Sarah Johnson</div>
                      <div className="text-[10px] font-mono text-slate-600">NPI: 1928374650</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-black uppercase">Conflict Filter</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-600 hover:text-danger transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-8">
            <button className="px-8 h-12 rounded-xl border border-border-dark text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">Discard</button>
            <button className="px-10 h-12 rounded-xl bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 transition-all">Save Matrix Configuration</button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary border border-primary/10 shadow-lg shadow-primary/5' : 'text-slate-500 hover:bg-surface-dark hover:text-slate-300'}`}>
      {icon}
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ThresholdCard({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="p-6 rounded-2xl bg-surface-dark border border-border-dark space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</label>
        <span className="text-xl font-mono font-bold text-white">{value}%</span>
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
    <div className="flex items-center justify-between p-5 rounded-2xl border border-border-dark bg-background-dark/30 hover:bg-background-dark/50 transition-colors">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
        <span className="text-[10px] text-slate-500 font-medium">{sub}</span>
      </div>
      <div className={`w-10 h-5 rounded-full p-1 transition-all ${checked ? 'bg-primary' : 'bg-slate-800'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
