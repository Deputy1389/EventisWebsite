import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/95 backdrop-blur px-6 py-4 lg:px-40">
        <div className="flex items-center gap-3 text-white">
          <div className="flex size-8 items-center justify-center rounded bg-primary text-white">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">LineCite</h2>
        </div>
        <div className="hidden lg:flex items-center gap-8">
          <nav className="flex gap-6">
            <a className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="#">Methodology</a>
            <a className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="#">Security</a>
            <a className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="#">FAQ</a>
          </nav>
          <Link href="/auth/signin">
            <button className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              Sign In
            </button>
          </Link>
        </div>
        <button className="lg:hidden text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main className="flex-1">
        <section className="px-6 py-16 lg:px-40 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
                    Deterministic Medical Chronologies for Litigation
                  </h1>
                  <p className="text-lg text-muted-foreground lg:text-xl leading-relaxed">
                    LineCite produces citation-anchored, export-validated medical chronologies built specifically for plaintiff-side litigation.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-bold text-white transition-colors hover:bg-primary-dark">Request Access</button>
                    <button className="flex items-center justify-center rounded-lg border border-border-dark bg-transparent px-8 py-3 text-base font-medium text-white transition-colors hover:bg-surface-dark">
                      View Methodology
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground/80">Access is currently limited to plaintiff-side litigation firms.</p>
                </div>
              </div>
              
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-border-dark bg-surface-dark group">
                <div className="absolute inset-0 bg-background-dark flex flex-col">
                  <div className="h-8 border-b border-border-dark flex items-center px-4 gap-2 bg-surface-dark">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/4 border-r border-border-dark p-4 hidden sm:block">
                      <div className="h-2 w-1/2 bg-border-dark rounded mb-4"></div>
                      <div className="h-2 w-3/4 bg-border-dark rounded mb-2"></div>
                      <div className="h-2 w-full bg-border-dark rounded mb-2"></div>
                      <div className="h-2 w-2/3 bg-border-dark rounded mb-6"></div>
                      <div className="h-2 w-1/2 bg-border-dark rounded mb-4"></div>
                      <div className="h-2 w-3/4 bg-border-dark rounded mb-2"></div>
                    </div>
                    <div className="flex-1 p-6 bg-background-dark relative">
                      <div className="w-full h-full bg-white/5 rounded p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-4 w-1/3 bg-white/20 rounded"></div>
                          <div className="h-4 w-16 bg-blue-500/20 rounded text-blue-400 text-[10px] flex items-center justify-center font-mono">CONFIDENTIAL</div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                          <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                          <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                        </div>
                        <div className="mt-8 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                          <div className="flex gap-2 items-center mb-2">
                            <span className="material-symbols-outlined text-blue-400 text-sm">link</span>
                            <span className="text-xs text-blue-300 font-mono">CITATION ANCHOR [Pg 42]</span>
                          </div>
                          <div className="h-2 w-full bg-blue-400/20 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-background-dark/95 backdrop-blur rounded border border-border-dark shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-mono text-blue-400 tracking-wider">ANCHORED SOURCE</span>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed font-mono">Deterministic extraction rules ensure that identical medical records produce identical chronologies, every time.</p>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-2">
                    <p className="text-xs text-muted-foreground font-mono">Source: Dr. Smith Report.pdf</p>
                    <span className="text-xs text-green-500 font-mono flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> VALIDATED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-dark border-y border-border-dark py-16">
          <div className="px-6 lg:px-40 mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black leading-tight text-white mb-6">Architected for Evidentiary Standards</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Unlike generalized tools, LineCite is architected to meet the rigorous admissibility and verification standards required in court.
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                      <span className="material-symbols-outlined text-[16px]">anchor</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Page-level citation anchoring</h4>
                      <p className="text-sm text-muted-foreground mt-1">Every extracted fact is hyperlinked directly to the source page coordinates.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Deterministic extraction pipeline</h4>
                      <p className="text-sm text-muted-foreground mt-1">Zero-temperature processing ensures identical inputs yield identical outputs.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Pre-export validation gates</h4>
                      <p className="text-sm text-muted-foreground mt-1">Automated logic checks prevent temporal hallucinations before human review.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="relative rounded-lg border border-border-dark bg-background-dark p-6 shadow-2xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-dark pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">LC</div>
                      <div className="text-sm font-semibold text-white">Smith v. Transport Co.</div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-surface-dark px-2 py-1 rounded">Read-Only Mode</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-4 p-3 bg-surface-dark/50 rounded border border-border-dark/50">
                      <div className="w-24 shrink-0 text-xs font-mono text-blue-400">10/12/2022</div>
                      <div className="flex-1">
                        <div className="text-sm text-white mb-1">Emergency Department Admission</div>
                        <div className="text-xs text-muted-foreground">Patient presented with C-spine tenderness...</div>
                      </div>
                      <div className="w-20 shrink-0 flex justify-end">
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">Pg. 14</span>
                      </div>
                    </div>
                    <div className="flex gap-4 p-3 bg-surface-dark/50 rounded border border-border-dark/50">
                      <div className="w-24 shrink-0 text-xs font-mono text-blue-400">10/14/2022</div>
                      <div className="flex-1">
                        <div className="text-sm text-white mb-1">MRI Lumbar Spine</div>
                        <div className="text-xs text-muted-foreground">Findings consistent with L4-L5 disc herniation...</div>
                      </div>
                      <div className="w-20 shrink-0 flex justify-end">
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">Pg. 28</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background-dark px-6 py-20 lg:px-40 border-b border-border-dark">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black leading-tight text-white lg:text-4xl mb-4">Where Generic Systems Break Down</h2>
              <p className="text-lg text-muted-foreground">Legal standards require precision, not approximation. Probabilistic language models introduce critical risks in litigation workflows.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-xl border border-border-dark bg-surface-dark p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500 mb-2">
                  <span className="material-symbols-outlined text-[28px]">link_off</span>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-bold text-white">Unanchored Summaries</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Generic outputs frequently summarize clinical events without specific page references, rendering the chronology useless for deposition preparation or trial exhibits.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-xl border border-border-dark bg-surface-dark p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 mb-2">
                  <span className="material-symbols-outlined text-[28px]">shuffle</span>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-bold text-white">Non-Deterministic Outputs</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Probabilistic token generation means the same medical record can yield different summaries. Litigation requires a deterministic pipeline where inputs reliably produce identical outputs.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-xl border border-border-dark bg-surface-dark p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 mb-2">
                  <span className="material-symbols-outlined text-[28px]">gavel</span>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-bold text-white">Lack of Defensibility</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Black-box summarization creates a chain-of-custody gap for facts. Without an audit trail linking extraction to source text, the work product cannot be independently verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background-dark py-12 text-center text-sm text-muted-foreground border-t border-border-dark">
        <div className="px-6 lg:px-40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2026 LineCite Inc. All rights reserved.</p>
          <div className="flex gap-8 text-xs font-medium">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
