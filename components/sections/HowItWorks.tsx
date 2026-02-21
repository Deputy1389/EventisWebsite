const steps = [
  {
    step: "01",
    title: "Upload Packet",
    desc: "Drop one or multiple medical PDFs into the matter workspace. We preserve per-document identity and page order.",
  },
  {
    step: "02",
    title: "Run Extraction",
    desc: "The engine identifies events, providers, citations, and litigation signals, then composes command-center artifacts.",
  },
  {
    step: "03",
    title: "Verify in Audit Mode",
    desc: "Click any event, contradiction, or claim and jump directly into the original source page to validate instantly.",
  },
  {
    step: "04",
    title: "Export Work Product",
    desc: "Generate chronology, specials, and missing-record output in formats your team already uses in active casework.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-secondary/45 py-18 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
            <h2 className="mt-2 text-3xl md:text-4xl">From upload to draft-ready outputs in one controlled flow</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((item) => (
            <div key={item.step} className="legal-glass rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary">{item.step}</p>
              <h3 className="mt-2 text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

