import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-18 md:pb-24 md:pt-24">
      <div className="absolute inset-0 fancy-grid opacity-30" />
      <div className="pointer-events-none absolute -left-28 top-6 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="float-in legal-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built for plaintiff firms running high-volume record review
        </div>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="float-in">
            <h1 className="text-balance text-4xl leading-tight md:text-6xl">
              The Command Center for
              <span className="text-gradient"> Medical Record Litigation</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Linecite transforms raw PDFs into court-ready chronology intelligence with evidence-linked citations, contradiction
              detection, and audit-first verification workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                <Link href="/pilot">
                  Book Pilot <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/sample">
                  <FileText className="mr-2 h-4 w-4" /> Open Sample Artifacts
                </Link>
              </Button>
            </div>
          </div>

          <div className="float-in legal-glass rounded-3xl p-6 shadow-xl shadow-primary/10">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Outcomes Firms Care About</p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-xl border bg-background/70 p-4">
                <p className="text-2xl font-semibold">6-12 hrs saved</p>
                <p className="text-sm text-muted-foreground">Per matter during initial chronology drafting</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-4">
                <p className="text-2xl font-semibold">Page-level traceability</p>
                <p className="text-sm text-muted-foreground">Every critical assertion anchored to source packet evidence</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-4">
                <p className="text-2xl font-semibold">Audit Mode verification</p>
                <p className="text-sm text-muted-foreground">Event list and original records side-by-side for immediate review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

