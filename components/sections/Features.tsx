import { Calculator, FileText, FileWarning, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Chronology Builder",
    description: "Chronological timeline with event summaries and citation anchors drafted for legal writing flow.",
    icon: FileText,
    bullets: ["DOCX and PDF export", "Provider and encounter normalization", "Top 10 case-driving events"],
  },
  {
    title: "Specials Intelligence",
    description: "Defense-ready and plaintiff-ready specials summaries based on extracted billing events and evidence.",
    icon: Calculator,
    bullets: ["Provider-level totals", "Linked invoice evidence", "Cost overview by treatment phase"],
  },
  {
    title: "Missing Record Radar",
    description: "Automatically surfaces treatment gaps and likely absent records from referral and care signals.",
    icon: FileWarning,
    bullets: ["Gap boundary anchors", "Request-ready output", "Coverage timeline visibility"],
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

