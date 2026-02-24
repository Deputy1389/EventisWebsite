import { Activity, ShieldAlert, GitBranch, FileSpreadsheet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Defense Exposure Engine™",
    description: "Surface every prior injury, inconsistent report, and clinical denial hidden in thousands of pages.",
    icon: ShieldAlert,
    bullets: ["Prior-injury detection", "Deposition-ready 'Smoking Guns'", "Automatic ICD-10 cross-referencing"],
  },
  {
    title: "Causation Mapping System™",
    description: "Map direct clinical paths from incident mechanics to objective diagnostic outcomes.",
    icon: GitBranch,
    bullets: ["Automated causation rungs", "Mechanical-Clinical linking", "ICD consistency checks"],
  },
  {
    title: "Narrative Engine™",
    description: "Transform chronological records into court-ready chronological arguments and tactical timelines.",
    icon: Activity,
    bullets: ["Continuum™ Record Layer", "Argument Mode Visualization", "Strategic Case Briefs"],
  },
  {
    title: "Intelligence Brief™",
    description: "Generate expert-level litigation intelligence reports formatted for immediate demand usage.",
    icon: FileSpreadsheet,
    bullets: ["Court-ready formatting", "Page-anchored citations", "Direct DOCX/PDF delivery"],
  },
];

export function Features() {
  return (
    <section className="py-24 bg-[#0F1217] relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E] mb-4">Intelligence Infrastructure</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">Everything your litigation team needs from one upload.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-[#161B22] border-[#232A34] shadow-2xl hover:border-[#C6A85E]/30 transition-all group">
              <CardHeader>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F1217] border border-[#232A34] text-[#C6A85E] group-hover:bg-[#C6A85E] group-hover:text-black transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                <p className="text-sm text-[#9CA3AF] leading-relaxed mt-2">{feature.description}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {feature.bullets.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[#F3F5F7] font-medium">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C6A85E]" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}