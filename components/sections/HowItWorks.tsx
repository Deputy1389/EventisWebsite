const steps = [
  {
    step: "01",
    title: "Initialize Matter Intelligence",
    desc: "Deploy Linecite against thousands of pages of raw medical records. Our engine establishes the Exposure Score™ and CCI™ instantly.",
  },
  {
    step: "02",
    title: "Navigate VectorStream™",
    desc: "Review the live risk intelligence feed. Click any alert to auto-scroll the Evidence Dock™ to the exact paragraph in the source document.",
  },
  {
    step: "03",
    title: "Project the Narrative Engine™",
    desc: "Switch to Argument Mode to visualize the Incident → Injury → Outcome chain, mapped with quantified evidence strength.",
  },
  {
    step: "04",
    title: "Export Intelligence Brief™",
    desc: "Generate court-ready litigation intelligence reports that reveal leverage and direct demand strategy automatically.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#161B22] py-24 border-y border-[#232A34]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E] mb-4">Command Flow</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">Time to Impact: Under 60 Seconds.</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((item) => (
            <div key={item.step} className="bg-[#0F1217] border border-[#232A34] rounded-2xl p-8 hover:border-[#C6A85E]/20 transition-all">
              <p className="text-xs font-black tracking-[0.3em] text-[#C6A85E] mb-4">{item.step}</p>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}