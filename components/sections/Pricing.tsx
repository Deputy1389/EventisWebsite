import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  { volume: "1-5 cases/month", price: "$150 per case" },
  { volume: "6-20 cases/month", price: "$125 per case" },
  { volume: "21+ cases/month", price: "$95 per case" },
];

const addOns = [
  { name: "Expert Binder", price: "+$40" },
  { name: "Billing Summary", price: "+$35" },
  { name: "Advanced Gap Detection", price: "+$30" },
];

export function Pricing() {
  return (
    <section className="border-t border-[#232A34] bg-[#0F1217] py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E]">Pricing</p>
          <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">Medical Chronologies for $150 per Case</h2>
          <p className="mt-4 text-sm text-[#9CA3AF]">Traditional manual chronology prep often costs $500-$1,500 per case.</p>
        </div>

        <div className="mx-auto grid gap-6 md:grid-cols-2">
          <Card className="border border-[#232A34] bg-[#161B22]">
            <CardHeader>
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-white">Per-Case Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.volume} className="flex items-center justify-between rounded-lg border border-[#232A34] bg-[#0F1217] px-4 py-3 text-sm">
                  <span className="text-[#F3F5F7]">{plan.volume}</span>
                  <span className="font-bold text-[#C6A85E]">{plan.price}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="text-xs text-[#9CA3AF]">Volume discounts are applied automatically.</CardFooter>
          </Card>

          <Card className="border border-[#232A34] bg-[#161B22]">
            <CardHeader>
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-white">Add-Ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addOns.map((addon) => (
                <div key={addon.name} className="flex items-center justify-between rounded-lg border border-[#232A34] bg-[#0F1217] px-4 py-3 text-sm">
                  <span className="text-[#F3F5F7]">{addon.name}</span>
                  <span className="font-bold text-[#C6A85E]">{addon.price}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="text-xs text-[#9CA3AF]">Typical fully loaded case is about $255.</CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="h-12 bg-[#C6A85E] px-8 font-bold text-black hover:bg-[#B08D4A]">
            <Link href="/pricing">View Full Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
