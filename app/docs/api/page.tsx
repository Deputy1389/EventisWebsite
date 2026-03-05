import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:px-40 flex flex-col lg:flex-row gap-16">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0 lg:sticky lg:top-32 h-fit">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Documentation</h2>
          <nav className="flex flex-col gap-4">
            <DocLink href="#introduction" label="Introduction" />
            <DocLink href="#authentication" label="Authentication" />
            <DocLink href="#base-url" label="Base URL" />
            <div className="h-px bg-border-dark my-2"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Endpoints</h3>
            <DocLink href="#extract-events" label="POST /extract-events" />
            <DocLink href="#verify-claim" label="POST /verify-claim" />
            <DocLink href="#resolve-citation" label="POST /resolve-citation" />
            <div className="h-px bg-border-dark my-2"></div>
            <DocLink href="#errors" label="Error Codes" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">
          <section id="introduction" className="mb-20">
            <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">API Documentation</h1>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              The LineCite Evidence Intelligence API allows developers to programmatically extract structured clinical events from medical record packets and verify claims against original evidentiary source documents.
            </p>
          </section>

          <section id="authentication" className="mb-20 pt-10 border-t border-border-dark">
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-widest">Authentication</h2>
            <p className="text-slate-400 mb-6 leading-relaxed font-medium">
              LineCite uses API keys to authenticate requests. You can view and manage your API keys in the dashboard under Settings.
            </p>
            <div className="bg-surface-dark p-6 rounded-xl border border-border-dark font-mono text-sm mb-6">
              <span className="text-primary font-bold">Authorization:</span> Bearer LC_YOUR_API_KEY
            </div>
            <p className="text-slate-500 text-sm italic">
              Keep your API keys secure. Do not share them in publicly accessible areas such as GitHub, client-side code, etc.
            </p>
          </section>

          <section id="base-url" className="mb-20 pt-10 border-t border-border-dark">
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-widest">Base URL</h2>
            <p className="text-slate-400 mb-6 leading-relaxed font-medium">
              All API requests should be made to the following base URL:
            </p>
            <div className="bg-black p-6 rounded-xl border border-border-dark font-mono text-sm text-primary">
              https://api.linecite.com/v1
            </div>
          </section>

          <section id="extract-events" className="mb-20 pt-10 border-t border-border-dark">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/20 text-primary rounded-md">POST</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">/extract-events</h2>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed font-medium">
              Submits a medical record packet for extraction. The API returns an Evidence Graph containing structured clinical events (visits, meds, imaging, etc.) anchored to specific page citations.
            </p>

            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Request Body</h4>
            <div className="bg-black p-6 rounded-xl border border-border-dark font-mono text-[13px] text-slate-300 mb-8">
              <pre>{`{
  "document_url": "https://your-bucket.com/packet.pdf",
  "webhook_url": "https://your-app.com/webhooks/linecite",
  "priority": "standard",
  "options": {
    "extract_billing": true,
    "detect_gaps": true
  }
}`}</pre>
            </div>

            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Response Example</h4>
            <div className="bg-black p-6 rounded-xl border border-border-dark font-mono text-[13px] text-slate-300">
              <pre>{`{
  "job_id": "job_LC_98234",
  "status": "processing",
  "estimated_completion": "2026-03-04T20:45:00Z"
}`}</pre>
            </div>
          </section>

          <section id="verify-claim" className="mb-20 pt-10 border-t border-border-dark">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/20 text-primary rounded-md">POST</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">/verify-claim</h2>
            </div>
            <p className="text-slate-400 mb-8 leading-relaxed font-medium">
              Verifies a natural language claim against the Evidence Graph of a previously processed job.
            </p>

            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Request Body</h4>
            <div className="bg-black p-6 rounded-xl border border-border-dark font-mono text-[13px] text-slate-300 mb-8">
              <pre>{`{
  "job_id": "job_LC_98234",
  "claim": "The patient had a lumbar MRI on Oct 12th showing L4-L5 herniation."
}`}</pre>
            </div>

            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Response Example</h4>
            <div className="bg-black p-6 rounded-xl border border-border-dark font-mono text-[13px] text-slate-300">
              <pre>{`{
  "verified": true,
  "confidence": 0.98,
  "supporting_events": ["event_42", "event_43"],
  "citation": {
    "page": 14,
    "snippet": "MRI Lumbar Spine: L4-L5 disc herniation..."
  }
}`}</pre>
            </div>
          </section>

          <section id="errors" className="mb-20 pt-10 border-t border-border-dark">
            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Error Codes</h2>
            <div className="grid gap-4">
              <ErrorRow code="400" title="Bad Request" description="The request body is malformed or missing required fields." />
              <ErrorRow code="401" title="Unauthorized" description="Invalid or missing API key." />
              <ErrorRow code="402" title="Payment Required" description="Insufficient credits or subscription expired." />
              <ErrorRow code="404" title="Not Found" description="The requested job or document does not exist." />
              <ErrorRow code="429" title="Too Many Requests" description="Rate limit exceeded for your tier." />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function DocLink({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
      {label}
    </Link>
  );
}

function ErrorRow({ code, title, description }: { code: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 p-6 bg-surface-dark/50 rounded-xl border border-border-dark items-start">
      <div className="text-primary font-black font-mono">{code}</div>
      <div>
        <h4 className="text-white font-bold mb-1 uppercase tracking-widest text-xs">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
