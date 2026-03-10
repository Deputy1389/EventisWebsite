import Link from "next/link";
import { Check } from "lucide-react";

const casePricing = [
  { volume: "1-5 cases/month", price: "$150" },
  { volume: "6-20 cases/month", price: "$125" },
  { volume: "21+ cases/month", price: "$95" },
];

const addOns = [
  { name: "Expert Binder", value: "Organized exhibit packet for experts and litigation prep", price: "+$40" },
  { name: "Billing Summary", value: "Specials total and provider-level billing breakdown", price: "+$35" },
  { name: "Advanced Gap Detection", value: "Missing record flags and request-ready gap output", price: "+$30" },
];

const monthlyPlans = [
  { name: "Starter", price: "$499/mo", included: "5 cases", overage: "$125/case" },
  { name: "Growth", price: "$1,299/mo", included: "15 cases", overage: "$110/case" },
  { name: "Pro", price: "$2,499/mo", included: "40 cases", overage: "$95/case" },
];

const apiPricing = [
  { volume: "1-100 packets/month", price: "$90" },
  { volume: "101-500 packets/month", price: "$75" },
  { volume: "500+ packets/month", price: "$60 (custom contract floor)" },
];

const apiAddOns = [
  { module: "expert_binder", price: "+$20" },
  { module: "billing_summary", price: "+$15" },
  { module: "gap_detection_advanced", price: "+$12" },
];

export default function PricingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1">
        <section className="px-6 py-20 text-center lg:px-24 lg:py-28">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-primary">Value Comparison</p>
          <h1 className="mb-6 text-4xl font-black uppercase tracking-widest text-white lg:text-6xl">Medical Chronologies for $150 per Case</h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-400">
            Traditional manual chronology prep often costs $500-$1,500 per case. CiteLine delivers citation-backed chronology and export-ready outputs in minutes.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 lg:grid-cols-2 lg:px-24">
          <div className="rounded-2xl border border-border-dark bg-background-dark/50 p-8">
            <h2 className="mb-1 text-xl font-black uppercase tracking-widest text-white">Per-Case Pricing</h2>
            <p className="mb-6 text-sm text-slate-400">Volume discounts are applied automatically.</p>
            <div className="overflow-hidden rounded-xl border border-border-dark">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-dark/80 text-xs uppercase tracking-widest text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Monthly Volume</th>
                    <th className="px-4 py-3">Price Per Case</th>
                  </tr>
                </thead>
                <tbody>
                  {casePricing.map((row) => (
                    <tr key={row.volume} className="border-t border-border-dark text-slate-200">
                      <td className="px-4 py-3">{row.volume}</td>
                      <td className="px-4 py-3 font-black text-white">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border-dark bg-background-dark/50 p-8">
            <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-white">Included With Every Case</h2>
            <ul className="space-y-3">
              {[
                "Citation-backed medical chronology timeline",
                "Source-page citation links",
                "Provider directory",
                "Basic missing-record detection",
                "PDF and DOCX exports",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-10 lg:px-24">
          <div className="rounded-2xl border border-border-dark bg-background-dark/50 p-8">
            <h2 className="mb-5 text-xl font-black uppercase tracking-widest text-white">Add-Ons</h2>
            <div className="overflow-hidden rounded-xl border border-border-dark">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-dark/80 text-xs uppercase tracking-widest text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Add-On</th>
                    <th className="px-4 py-3">What It Adds</th>
                    <th className="px-4 py-3">Price Per Case</th>
                  </tr>
                </thead>
                <tbody>
                  {addOns.map((row) => (
                    <tr key={row.name} className="border-t border-border-dark text-slate-200">
                      <td className="px-4 py-3 font-bold text-white">{row.name}</td>
                      <td className="px-4 py-3">{row.value}</td>
                      <td className="px-4 py-3 font-black text-white">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-400">Typical fully loaded case: about $255 ($150 base + all 3 add-ons).</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-10 lg:px-24">
          <div className="rounded-2xl border border-border-dark bg-background-dark/50 p-8">
            <h2 className="mb-5 text-xl font-black uppercase tracking-widest text-white">Optional Monthly Convenience Plans</h2>
            <div className="overflow-hidden rounded-xl border border-border-dark">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-dark/80 text-xs uppercase tracking-widest text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Included Cases</th>
                    <th className="px-4 py-3">Overage</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyPlans.map((row) => (
                    <tr key={row.name} className="border-t border-border-dark text-slate-200">
                      <td className="px-4 py-3 font-bold text-white">{row.name}</td>
                      <td className="px-4 py-3 font-black text-white">{row.price}</td>
                      <td className="px-4 py-3">{row.included}</td>
                      <td className="px-4 py-3">{row.overage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-10 lg:px-24">
          <div className="rounded-2xl border border-border-dark bg-background-dark/50 p-8">
            <h2 className="mb-5 text-xl font-black uppercase tracking-widest text-white">API Pricing</h2>
            <p className="mb-4 text-sm text-slate-400">A packet is one medical-record bundle submitted for processing.</p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-border-dark">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-dark/80 text-xs uppercase tracking-widest text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Monthly Packet Volume</th>
                      <th className="px-4 py-3">Price Per Packet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiPricing.map((row) => (
                      <tr key={row.volume} className="border-t border-border-dark text-slate-200">
                        <td className="px-4 py-3">{row.volume}</td>
                        <td className="px-4 py-3 font-black text-white">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-hidden rounded-xl border border-border-dark">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-dark/80 text-xs uppercase tracking-widest text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3">Price Per Packet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiAddOns.map((row) => (
                      <tr key={row.module} className="border-t border-border-dark text-slate-200">
                        <td className="px-4 py-3 font-mono text-primary">{row.module}</td>
                        <td className="px-4 py-3 font-black text-white">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">Billing formula: packet_total = base_packet_price + sum(enabled_addon_prices).</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-24">
          <div className="grid gap-4 rounded-2xl border border-border-dark bg-background-dark/50 p-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">Enterprise</h3>
              <p className="text-sm text-slate-400">Unlimited volume contracts, SSO, custom retention, API access, and dedicated support.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/pilot?type=firm" className="rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-dark">
                Run Your First Case
              </Link>
              <Link href="/pilot?type=api" className="rounded-xl border border-border-dark bg-surface-dark px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/5">
                Request API Access
              </Link>
              <a href="mailto:patrick@linecite.com" className="rounded-xl border border-border-dark bg-surface-dark px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/5">
                Talk to Sales
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
