import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function LawFirmsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1">
        <section className="px-6 py-20 lg:px-40 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h1 className="text-5xl font-black leading-tight tracking-tight text-white lg:text-7xl">
                    Litigation-ready medical chronologies, backed by citations
                  </h1>
                  <p className="text-xl text-slate-400 lg:text-2xl leading-relaxed font-medium">
                    Upload records. Get a structured chronology built from a deterministic evidence model. Every event is page-linked.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/pilot?type=firm" className="flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark shadow-xl shadow-primary/20 active:scale-95">
                    Request Firm Access
                  </Link>
                  <Link href="/tech" className="flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-white/5 active:scale-95">
                    See Methodology
                  </Link>
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-3xl border border-border-dark bg-surface-dark p-6">  
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-between border-b border-border-dark pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">LC</div>
                      <div className="text-sm font-black text-white uppercase tracking-widest">Smith v. Transport Co.</div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-surface-light px-3 py-1 rounded-full">Read-Only Mode</div>
                  </div>
                  <div className="space-y-4 overflow-hidden">
                    <div className="flex gap-4 p-4 bg-background-dark/50 rounded-xl border border-border-dark/50 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                      <div className="w-24 shrink-0 text-xs font-mono text-primary font-bold">10/12/2022</div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-white uppercase tracking-wider mb-1">Emergency Department Admission</div>
                        <div className="text-xs text-slate-500 leading-relaxed">Patient presented with C-spine tenderness and restricted range of motion...</div>
                      </div>
                      <div className="w-20 shrink-0 flex justify-end">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-black uppercase tracking-widest">Pg. 14</span>    
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-background-dark/50 rounded-xl border border-border-dark/50 relative overflow-hidden group opacity-80">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/10"></div>
                      <div className="w-24 shrink-0 text-xs font-mono text-primary font-bold">10/14/2022</div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-white uppercase tracking-wider mb-1">MRI Lumbar Spine</div>
                        <div className="text-xs text-slate-500 leading-relaxed">Findings consistent with L4-L5 disc herniation. Signal changes observed...</div>
                      </div>
                      <div className="w-20 shrink-0 flex justify-end">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-black uppercase tracking-widest">Pg. 28</span>    
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-background-dark/50 rounded-xl border border-border-dark/50 relative overflow-hidden group opacity-60">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/10"></div>
                      <div className="w-24 shrink-0 text-xs font-mono text-primary font-bold">10/20/2022</div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-white uppercase tracking-wider mb-1">Pain Management Consult</div>
                        <div className="text-xs text-slate-500 leading-relaxed">Evaluation of chronic lumbar pain following trauma...</div>
                      </div>
                      <div className="w-20 shrink-0 flex justify-end">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-black uppercase tracking-widest">Pg. 35</span>    
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
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white lg:text-5xl">Core Deliverables</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DeliverableCard 
                icon="description" 
                title="Medical Chronology PDF" 
                description="A citation-linked, export-ready chronology built for litigation demands."
              />
              <DeliverableCard 
                icon="group" 
                title="Provider Index" 
                description="Automatically organized list of providers and facilities across the packet."
              />
              <DeliverableCard 
                icon="verified_user" 
                title="Clinical Summaries" 
                description="Key diagnoses and procedures extracted and linked to source evidence."
              />
              <DeliverableCard 
                icon="flag" 
                title="Gaps & Gaps report" 
                description="Automatic identification of missing periods and inconsistent medical records."
              />
              <DeliverableCard 
                icon="save" 
                title="Expert Binder Bundles" 
                description="Ready-to-use artifact bundles for expert witnesses and mediation."
              />
              <DeliverableCard 
                icon="account_tree" 
                title="Deterministic Model" 
                description="Same input always yields the same output. No hallucinations."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 lg:px-40 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl font-black text-white lg:text-5xl mb-12">Litigation Workflow</h2>
              <div className="space-y-12">
                <WorkflowStep 
                  number="01" 
                  title="Upload Packet" 
                  description="Upload full case packets including scanned, faxed, and digitally-produced records."
                />
                <WorkflowStep 
                  number="02" 
                  title="Review Evidence" 
                  description="Use Audit Mode to review events, resolve ambiguities, and add annotations."
                />
                <WorkflowStep 
                  number="03" 
                  title="Export Chronology" 
                  description="Generate court-ready artifacts and binder-ready exports in seconds."
                />
              </div>
            </div>
            <div className="p-10 rounded-2xl border border-border-dark bg-background-dark shadow-3xl">
              <h4 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Built for high-stakes litigation</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="check" className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">PI Firms</h5>
                    <p className="text-slate-500 text-sm">Streamline medical review for auto and premises liability cases.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="check" className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">Med-Mal</h5>
                    <p className="text-slate-500 text-sm">Identify critical timeline gaps and treatment inconsistencies.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="check" className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">Litigation Support</h5>
                    <p className="text-slate-500 text-sm">Scale your firm's paralegal capacity with extraction automation.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-20 lg:px-40 text-center">
          <h2 className="text-3xl font-black text-white lg:text-5xl mb-8">Ready to automate your medical review?</h2>
          <Link href="/pilot?type=firm" className="inline-flex items-center justify-center bg-white text-primary px-12 py-5 rounded-xl font-black uppercase tracking-widest text-base hover:bg-slate-100 transition-colors shadow-2xl active:scale-95">
            Request Firm Access
          </Link>
        </section>
      </main>
    </div>
  );
}

function DeliverableCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border-dark bg-background-dark/50 hover:border-primary/30 transition-all group">
      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function WorkflowStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6">
      <div className="text-4xl font-black text-primary/20">{number}</div>
      <div>
        <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
