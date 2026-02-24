import {  Search, ShieldCheck, Target } from "lucide-react";

const pillars = [
  {
    title: "Extraction is not Intelligence",
    desc: "While others organize records, Linecite reveals leverage. We quantify defense side risk and map causation chains automatically.",
    icon: Target,
  },
  {
    title: "Litigation Infrastructure",
    desc: "We provide the command-level system medical litigation has lacked. Unified intelligence, not just workflow assistance.",
    icon: Search,
  },
  {
    title: "Category-Defining Moats",
    desc: "Powered by a proprietary indexed litigation ontology and risk-scoring models refined for personal injury law.",
    icon: ShieldCheck,
  },
];

export function WhyLinecite() {
  return (
    <section className="py-24 bg-[#0F1217]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E] mb-4">The Linecite Edge</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">We do not organize records. We reveal leverage.</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title} className="bg-[#161B22] border border-[#232A34] rounded-3xl p-8 shadow-2xl hover:-translate-y-1 transition-all">
              <div className="mb-6 inline-flex rounded-xl bg-[#0F1217] border border-[#232A34] p-3 text-[#C6A85E]">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}