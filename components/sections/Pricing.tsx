import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    title: "Foundation",
    price: "$4,000",
    note: "/month",
    items: [
      "Defense Exposure Index™",
      "Causation Confidence Index™",
      "VectorStream™ Alert Feed",
      "Intelligence Brief™ Generation",
      "Priority Clinical Mapping",
    ],
    highlight: false,
  },
  {
    title: "Strategic",
    price: "$15,000",
    note: "/month",
    items: [
      "Unlimited Matters",
      "Full Narrative Engine™ Access",
      "Shield Matrix™ Vulnerability Analysis",
      "API & Workflow Integration",
      "White-labeled Briefs",
    ],
    highlight: true,
  },
  {
    title: "Institutional",
    price: "$250k+",
    note: "/year",
    items: [
      "Dedicated Intelligence Cluster",
      "Custom Ontology Tuning",
      "Private Cloud Deployment",
      "Enterprise Integrations",
      "Trial Simulation Support",
    ],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="bg-[#0F1217] py-24 border-t border-[#232A34]" id="pricing">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E] mb-4">Infrastructure Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">Mission Critical Positioning for Legal Teams</h2>
        </div>

        <div className="mx-auto grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className={`relative border ${plan.highlight ? "border-[#C6A85E] shadow-2xl shadow-[#C6A85E]/10" : "border-[#232A34]"} bg-[#161B22]`}
            >
              {plan.highlight && (
                <span className="absolute right-4 top-4 rounded-full bg-[#C6A85E] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black">
                  Strategic Choice
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">{plan.title}</CardTitle>
                <p className="mt-4 text-4xl font-extrabold text-white">
                  {plan.price} <span className="text-sm font-medium text-[#9CA3AF] tracking-normal">{plan.note}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {plan.items.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#C6A85E] mt-0.5" />
                    <span className="text-sm text-[#F3F5F7] font-medium leading-tight">{item}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-8">
                <Button asChild className="w-full h-12 font-bold bg-[#C6A85E] hover:bg-[#B08D4A] text-black shadow-lg shadow-[#C6A85E]/10" variant={plan.highlight ? "default" : "outline"}>
                  <Link href="/pilot">REQUEST DEMO</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-[#9CA3AF] font-bold uppercase tracking-widest">
          No per-seat pricing. Pure intelligence infrastructure.
        </p>
      </div>
    </section>
  );
}