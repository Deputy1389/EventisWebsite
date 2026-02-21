import { Link2, Search, ShieldCheck } from "lucide-react";

const pillars = [
  {
    title: "Citation Fidelity",
    desc: "Every major claim is traceable to packet evidence, reducing review uncertainty and demand-letter risk.",
    icon: Link2,
  },
  {
    title: "Deterministic Core",
    desc: "Structure-first extraction avoids loose narrative drift and keeps outputs anchored in what the records actually show.",
    icon: Search,
  },
  {
    title: "Litigation Guard Rails",
    desc: "Quality and legal-usability checks surface weak spots before anything reaches an attorney or client-facing draft.",
    icon: ShieldCheck,
  },
];

export function WhyLinecite() {
  return (
    <section className="py-18 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Why Firms Switch</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Built to stand up in litigation, not just look nice in demos</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title} className="rounded-3xl border bg-background/80 p-6 shadow-xl shadow-primary/5">
              <div className="mb-4 inline-flex rounded-xl bg-primary p-2 text-primary-foreground">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

