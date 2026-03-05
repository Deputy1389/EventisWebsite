import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1">
        <section className="px-6 py-20 lg:px-40 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white lg:text-7xl">
                    Evidence Extraction for Litigation
                  </h1>
                  <p className="text-xl text-slate-400 lg:text-2xl leading-relaxed font-medium">
                    Structured medical events. Citation‑Backed Claims. Deterministic Outputs.
                  </p>
                  <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                    Upload medical records and generate structured evidence, timelines, and litigation artifacts — or integrate our extraction engine via API.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/law-firms" className="flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark shadow-xl shadow-primary/20 active:scale-95">
                    For Law Firms
                  </Link>
                  <Link href="/developers" className="flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-white/5 active:scale-95">
                    For Developers
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-widest pt-4">
                  <span className="flex items-center gap-2"><Icon name="check" className="text-primary w-4 h-4" /> Deterministic Pipeline</span>
                  <span className="flex items-center gap-2"><Icon name="check" className="text-primary w-4 h-4" /> Citation Integrity</span>
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-3xl border border-border-dark bg-surface-dark group">  
                <div className="absolute inset-0 bg-background-dark flex flex-col">
                  <div className="h-10 border-b border-border-dark flex items-center px-4 gap-2 bg-surface-dark">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/4 border-r border-border-dark p-6 hidden sm:block bg-surface-dark/30">
                      <div className="h-2 w-1/2 bg-slate-800 rounded mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-1 w-full bg-slate-800 rounded"></div>
                        <div className="h-1 w-3/4 bg-slate-800 rounded"></div>
                        <div className="h-1 w-5/6 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 p-8 bg-background-dark relative">
                      <div className="w-full h-full bg-white/[0.02] rounded-xl p-6 border border-white/[0.05] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-5 w-1/3 bg-white/10 rounded"></div>
                          <div className="px-2 py-1 bg-primary/10 rounded text-primary text-[10px] font-black uppercase tracking-widest">VALIDATED</div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-2 w-full bg-white/5 rounded"></div>
                          <div className="h-2 w-full bg-white/5 rounded"></div>
                          <div className="h-2 w-2/3 bg-white/5 rounded"></div>
                        </div>
                        <div className="mt-12 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                          <div className="flex gap-3 items-center mb-3">
                            <Icon name="link" className="text-primary w-4 h-4" />
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">CITATION ANCHOR [Pg 42]</span>
                          </div>
                          <div className="h-2 w-full bg-primary/20 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-dark border-y border-border-dark py-24">
          <div className="px-6 lg:px-40 mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Choose Your Path</h2>
              <h3 className="text-3xl font-black text-white lg:text-5xl">Architected for Professional Workflows</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group relative p-10 rounded-2xl border border-border-dark bg-background-dark transition-all hover:border-primary/50">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name="gavel" className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-white mb-4">For Law Firms</h4>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">Upload medical records and get a litigation-ready chronology.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">Page-cited events, provider/facility rollups, and gap analysis.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">Exports for demands, mediation, and expert binders.</span>
                  </li>
                </ul>
                <Link href="/law-firms" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                  Request Firm Access <Icon name="chevron_right" className="w-4 h-4" />
                </Link>
              </div>

              <div className="group relative p-10 rounded-2xl border border-border-dark bg-background-dark transition-all hover:border-primary/50">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name="rocket_launch" className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-white mb-4">For Platforms / Developers</h4>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">API for medical event extraction and citation resolution.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">Claim verification against evidentiary source documents.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <Icon name="check" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">Versioned schema, webhooks, and granular usage metering.</span>
                  </li>
                </ul>
                <Link href="/developers" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                  View API Documentation <Icon name="chevron_right" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 lg:px-40 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="description" className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white mb-3">Structured Events</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Turn PDFs into canonical medical events: visits, imaging, procedures, meds, and diagnoses.
              </p>
            </div>
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="account_tree" className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white mb-3">Evidence Graph</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Events connected to providers, facilities, conditions, and citations in a unified graph.
              </p>
            </div>
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="verified_user" className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white mb-3">Citation-Backed Claims</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Every statement is traced to a precise page location and snippet for absolute verification.
              </p>
            </div>
          </div>
        </section>
        
        <section className="bg-primary px-6 py-20 lg:px-40 text-center">
          <h2 className="text-3xl font-black text-white lg:text-5xl mb-8 max-w-3xl mx-auto leading-tight">
            Ready to integrate structured medical intelligence?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pilot?type=firm" className="bg-white text-primary px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-colors shadow-2xl">
              Request Firm Access
            </Link>
            <Link href="/pilot?type=api" className="bg-primary-dark text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm border border-white/20 hover:bg-black/20 transition-colors">
              Request API Access
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
