import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function DevelopersPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1">
        <section className="px-6 py-20 lg:px-40 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Evidence Intelligence API</h2>
                  <h1 className="text-5xl font-black leading-tight tracking-tight text-white lg:text-7xl">
                    Structured Medical Events API
                  </h1>
                  <p className="text-xl text-slate-400 lg:text-2xl leading-relaxed font-medium">
                    Convert messy medical record PDFs into structured medical events with page-level provenance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/pilot?type=api" className="flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark shadow-xl shadow-primary/20 active:scale-95">
                    Request API Access
                  </Link>
                  <Link href="/docs/api" className="flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark px-10 py-4 text-base font-black uppercase tracking-widest text-white transition-all hover:bg-white/5 active:scale-95">
                    Read API Docs
                  </Link>
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-3xl border border-border-dark bg-black p-0 group">  
                <div className="bg-slate-900 border-b border-border-dark flex items-center px-4 py-2 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-600">GET /v1/extract-events</div>
                </div>
                <pre className="p-8 text-[13px] font-mono leading-relaxed text-slate-300 overflow-auto h-full scrollbar-hide">
                  <code>{`{
  "job_id": "job_123",
  "events": [
    {
      "event_type": "imaging",
      "date": "2023-04-17",
      "summary": "MRI lumbar spine",
      "provider": "Radiology Dept.",
      "facility": "ABC Medical Center",
      "provenance": {
        "document_id": "doc_9",
        "page": 42,
        "span": [120, 210]
      },
      "confidence": 0.94,
      "flags": []
    }
  ]
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-dark border-y border-border-dark py-24">
          <div className="px-6 lg:px-40 mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black text-white lg:text-5xl mb-20 uppercase tracking-widest">Core API Primitives</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <EndpointCard 
                method="POST" 
                endpoint="/extract-events" 
                title="Extract Events" 
                description="Converts PDFs into canonical medical events: visits, imaging, procedures, meds, and diagnoses with provenance."
              />
              <EndpointCard 
                method="POST" 
                endpoint="/verify-claim" 
                title="Verify Claim" 
                description="Checks a medical claim against source evidence, returning supported, contradicted, or unknown status."
              />
              <EndpointCard 
                method="POST" 
                endpoint="/resolve-citation" 
                title="Resolve Citation" 
                description="Returns page, snippet, and bounding box coordinates for a specific medical event in the packet."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 lg:px-40 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-3xl font-black text-white lg:text-5xl mb-12 uppercase tracking-widest">Job Lifecycle</h2>
              <div className="space-y-12">
                <WorkflowStep 
                  number="01" 
                  title="Submit Packet" 
                  description="Upload medical packets via async jobs. Receive a job ID for tracking extraction progress."
                />
                <WorkflowStep 
                  number="02" 
                  title="Poll Status / Webhooks" 
                  description="Poll the job status or register webhooks for job.completed and job.failed events."
                />
                <WorkflowStep 
                  number="03" 
                  title="Retrieve Results" 
                  description="Get the evidence graph, structured events, and resolved citations once the job completes."
                />
              </div>
            </div>
            
            <div className="bg-background-dark p-10 rounded-2xl border border-border-dark shadow-3xl">
              <h4 className="text-xl font-black text-white mb-8 uppercase tracking-widest">Contract Guarantees</h4>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="verified" className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">Versioned Schema</h5>
                    <p className="text-slate-500 text-sm leading-relaxed">No breaking changes without a major version bump (/v1). Stability as a first-class feature.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="lock" className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">Tenant Isolation</h5>
                    <p className="text-slate-500 text-sm leading-relaxed">Per-tenant data isolation and encryption. No cross-tenant data leakage or model training.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Icon name="timer" className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">Low Latency Pipeline</h5>
                    <p className="text-slate-500 text-sm leading-relaxed">Optimized extraction pipeline designed for high-throughput and large packets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-24 lg:px-40 text-center">
          <h2 className="text-3xl font-black text-white lg:text-5xl mb-12 uppercase tracking-widest">Talk to our Engineering team</h2>
          <Link href="/pilot?type=api" className="inline-flex items-center justify-center bg-white text-primary px-12 py-5 rounded-xl font-black uppercase tracking-widest text-base hover:bg-slate-100 transition-colors shadow-2xl active:scale-95">
            Request API Access
          </Link>
        </section>
      </main>
    </div>
  );
}

function EndpointCard({ method, endpoint, title, description }: { method: string, endpoint: string, title: string, description: string }) {
  return (
    <div className="p-10 rounded-2xl border border-border-dark bg-background-dark/50 hover:border-primary/50 transition-all group">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/20 text-primary rounded-md">{method}</span>
        <code className="text-xs text-slate-500 font-mono">{endpoint}</code>
      </div>
      <h4 className="text-xl font-black text-white uppercase tracking-widest mb-4">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function WorkflowStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-8">
      <div className="text-4xl font-black text-primary/20 tracking-tighter">{number}</div>
      <div>
        <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-slate-500 leading-relaxed max-w-md">{description}</p>
      </div>
    </div>
  );
}
