import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    title: "Chronology Core",
    price: "$150",
    note: "Per matter",
    items: [
      "Chronology output (DOCX/PDF)",
      "Packet-linked citations",
      "Up to 500 pages",
      "Audit Mode verification",
    ],
    highlight: false,
  },
  {
    title: "Litigation Suite",
    price: "$250",
    note: "Per matter",
    items: [
      "Everything in Chronology Core",
      "Specials summary output",
      "Missing-record strategy report",
      "Up to 1000 pages",
    ],
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section className="bg-secondary/45 py-18 md:py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Straightforward per-case pricing for legal operations</h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className={`relative border ${plan.highlight ? "border-primary shadow-2xl shadow-primary/15" : "border-border/80"} bg-background/90`}
            >
              {plan.highlight && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
                  Recommended
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <p className="text-4xl font-semibold">
                  {plan.price} <span className="text-base font-normal text-muted-foreground">{plan.note}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {plan.items.map((item) => (
                  <p key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {item}
                  </p>
                ))}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  <Link href="/pilot">Start Pilot</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Enterprise-volume pricing available for firms with recurring docket throughput.
        </p>
      </div>
    </section>
  );
}

