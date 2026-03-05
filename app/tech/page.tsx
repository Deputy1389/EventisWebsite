"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export default function TechPage() {
  const [activeTab, setActiveTab] = useState<'litigation' | 'platform'>('litigation');

  return (
    <div className="bg-background-dark text-slate-200 font-display min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-6xl px-8 py-24 md:py-32">
          <div className="flex flex-col gap-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] w-fit">
              <Icon name="verified" className="text-[16px]" />
              Methodology & Rigor
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter text-white uppercase max-w-4xl">
              Engineered for <br/>
              <span className="text-primary italic">Evidentiary Integrity</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl leading-relaxed font-medium">
              LineCite replaces probabilistic approximation with a deterministic pipeline. Identical inputs yield identical outputs—every time.
            </p>
          </div>
        </section>

        <section className="w-full max-w-6xl px-8 pb-32">
          <div className="flex justify-start mb-20 border-b border-border-dark">
            <button 
              onClick={() => setActiveTab('litigation')}
              className={`pb-6 px-8 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'litigation' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
            >
              Litigation Methodology
              {activeTab === 'litigation' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-primary"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('platform')}
              className={`pb-6 px-8 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'platform' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
            >
              Platform Methodology
              {activeTab === 'platform' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-primary"></div>}
            </button>
          </div>

          {activeTab === 'litigation' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="grid lg:grid-cols-2 gap-20">
                <div className="space-y-16">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Evidence Provenance</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      In high-stakes litigation, an unanchored summary is a liability. Every extracted medical event in LineCite is permanently linked to its source page coordinates. This allows attorneys to verify the evidence in seconds, not hours.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Citation Integrity</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      Our pipeline enforces citation validity at every step. If a fact cannot be definitively mapped to a source snippet, it is rejected by the extraction engine. We prioritize accuracy over completeness to ensure court-room admissibility.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Deterministic Outputs</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      Unlike generic AI tools, LineCite is deterministic. This means that if you process the same medical packet twice, you get the exact same chronology. No narrative drift. No hallucinated events. No "vibes."
                    </p>
                  </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-3xl p-10 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Icon name="gavel" className="text-[200px] text-white" />
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-widest mb-8">Evidentiary Standards</h4>
                  <ul className="space-y-8">
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="verified_user" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Admissibility Ready</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">Page-anchored citations ensure compliance with evidentiary rules.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="shuffle" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Consistency Guarantee</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">No narrative drift between different exports of the same evidence graph.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="search" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Audit Trail</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">Full audit log of any modifications made in Audit Mode.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid lg:grid-cols-2 gap-20">
                <div className="space-y-16">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Evidence Graph Model</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      LineCite converts medical record packets into a canonical Evidence Graph. Every entity—provider, facility, date, and event—is normalized and interconnected, enabling complex programmatic queries over clinical data.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Extraction Pipeline</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      Our multi-stage pipeline combines high-fidelity OCR with rigid extraction rules. Each clinical event (Imaging, Procedures, Meds, Diagnoses) is processed through specific validation gates to ensure schema compliance.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Schema Stability</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      We treat our evidence model as a contract. Versioned schemas (/v1) ensure that your integrations remain stable even as our extraction engine evolves. No breaking changes without a version bump.
                    </p>
                  </div>
                </div>
                <div className="bg-black border border-border-dark rounded-3xl p-10 flex flex-col justify-center">
                  <h4 className="text-xl font-black text-white uppercase tracking-widest mb-8">The Platform Contract</h4>
                  <ul className="space-y-8">
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="settings" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Determinism as Service</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">Inputs always map to identical outputs. Temperature=0 by design at every stage.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="account_tree" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Invariant Enforcement</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">Rule-based gates block low-confidence escalations automatically.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-5">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                        <Icon name="link" className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1 uppercase tracking-widest text-sm">Mandatory Provenance</h5>
                        <p className="text-slate-500 text-sm leading-relaxed">The schema requires valid page coordinates for every clinical event.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-primary px-6 py-24 lg:px-40 text-center w-full">
          <h2 className="text-3xl font-black text-white lg:text-5xl mb-8 uppercase tracking-widest">Questions about our pipeline?</h2>
          <a href="mailto:patrick@linecite.com" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.4em] text-white hover:gap-8 transition-all">
            Talk to Engineering <Icon name="chevron_right" className="w-6 h-6" />
          </a>
        </section>
      </main>
    </div>
  );
}
