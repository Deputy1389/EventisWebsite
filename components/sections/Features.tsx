import { Brain, FileText, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Semantic Reasoning",
    description: "Our LLM reasoning layer cross-references thousands of pages to find subtle contradictions and case-winning claims.",
    icon: Brain,
    bullets: ["Prior-injury detection", "Deposition-ready 'Smoking Guns'", "Automatic ICD-10 cross-referencing"],
  },
  {
    title: "Injury Arc Chronology",
    description: "Clinical-grade timelines that prioritize high-impact events like MRIs, fractures, and surgeries for immediate review.",
    icon: FileText,
    bullets: ["Hot-event highlighting", "Page-level citation anchors", "Direct DOCX/PDF export"],
  },
  {
    title: "Strategic Moat Analysis",
    description: "Detect treatment gaps, missing records, and defense attack paths before the other side finds them.",
    icon: ShieldCheck,
    bullets: ["Referral gap detection", "Defense exposure screening", "Audit-first validation"],
  },
];

export function Features() {
  return (
    <section className="py-18 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Platform Capabilities</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Everything your litigation team needs from one upload</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="legal-glass border-0 shadow-xl shadow-primary/8">    
              <CardHeader>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {feature.bullets.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
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
