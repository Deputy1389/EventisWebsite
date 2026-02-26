export default function TechPage() {
  return (
    <div className="bg-background-dark text-slate-200 font-display min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl px-8 py-24 md:py-32">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em] w-fit">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Technical Whitepaper
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white uppercase">
              Methodology & <br/>
              <span className="text-primary italic">Technical Rigor</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed font-medium">
              LineCite employs a deterministic pipeline to ensure evidentiary standards and absolute citation accuracy for medical chronologies. Our architecture prioritizes reproducibility over generative approximation.
            </p>
          </div>
        </section>

        {/* Pipeline Diagram */}
        <section className="w-full max-w-5xl px-8 pb-32">
          <div className="flex flex-col gap-16">
            <div className="border-l-4 border-primary pl-8 py-2">
              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">The Deterministic Pipeline</h2>
              <p className="text-slate-500 text-lg max-w-2xl font-medium">
                LineCite enforces strict data extraction rules ensuring that identical inputs yield identical outputs, every time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ProcessCard 
                num="01" 
                icon="input" 
                title="Ingestion & OCR" 
                text="Raw medical records are processed via high-fidelity OCR. We preserve spatial context for handwritten notes and charts." 
              />
              <ProcessCard 
                num="02" 
                icon="filter_center_focus" 
                title="Deterministic Extraction" 
                text="Structured rules identify clinical events without interpretation. Entities are isolated using rigid pattern matching." 
              />
              <ProcessCard 
                num="03" 
                icon="fact_check" 
                title="Verification" 
                text="Every point is cross-referenced. Points not tied to specific pixel coordinates in the source PDF are rejected." 
              />
            </div>

            <div className="mt-12 p-10 rounded-[32px] bg-primary/5 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-8xl text-primary">verified_user</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                Determinism Guarantee
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-3xl">
                LineCite enforces deterministic extraction. Identical source documents will always produce identical chronologies. This eliminates the variability and hallucination risks common in standard LLM systems.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProcessCard({ num, icon, title, text }: { num: string, icon: string, title: string, text: string }) {
  return (
    <div className="group relative flex flex-col gap-6 p-8 rounded-3xl bg-surface-dark border border-border-dark hover:border-primary/40 transition-all duration-500 shadow-sm">
      <div className="absolute top-8 right-8 text-slate-800 text-7xl font-black opacity-20 group-hover:opacity-40 transition-opacity select-none font-mono tracking-tighter">{num}</div>
      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div className="space-y-3 z-10">
        <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{text}</p>
      </div>
    </div>
  );
}
