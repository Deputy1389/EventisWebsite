import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How reliable are chronology outputs for active litigation?",
    a: "Outputs are generated from structured extraction with citation fidelity checks. Ambiguous content is surfaced for review instead of silently guessed.",
  },
  {
    q: "Can attorneys jump from chronology lines to original records?",
    a: "Yes. Audit Mode and generated reports include page-level source links so teams can validate facts directly in the packet.",
  },
  {
    q: "How is client data handled?",
    a: "Tenant controls, encrypted storage, and access-scoped APIs are built into the workflow. Data is not used to train general-purpose models.",
  },
  {
    q: "Who gets the most value from Linecite?",
    a: "PI and med-mal teams with heavy record volume, repeat chronology drafting, and frequent demand/mediation packet prep.",
  },
];

export function FAQ() {
  return (
    <section className="py-18 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[0.95fr_1.05fr] md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Questions firms ask before rollout</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pilot onboarding includes a real case dry-run and side-by-side output review with your team.
          </p>
        </div>
        <div className="legal-glass rounded-3xl p-4 md:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={item.q} value={`item-${idx + 1}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

