"use client";

import { Icon } from "@/components/ui/icon";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-black text-white mb-8 uppercase tracking-widest text-center">Security & Compliance</h1>
        <p className="text-xl text-slate-400 mb-20 text-center max-w-3xl mx-auto leading-relaxed font-medium">
          LineCite is architected for the sensitive nature of medical and legal records. We maintain rigorous standards for data isolation and tenant boundaries.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <SecuritySection 
            title="Data Isolation" 
            icon="lock"
            items={[
              "Tenant-level logical separation for all case data.",
              "Isolated processing containers for every extraction job.",
              "Strict IAM policies and least-privilege access controls.",
              "No cross-tenant data leakage or shared cache."
            ]}
          />
          <SecuritySection 
            title="Encryption & Transit" 
            icon="shield_check"
            items={[
              "AES-256 encryption at rest for all storage volumes.",
              "TLS 1.3 enforced for all data in transit.",
              "Per-tenant encryption keys for sensitive fields.",
              "Secure, hardened cloud infrastructure (AWS/GCP)."
            ]}
          />
          <SecuritySection 
            title="Data Policies" 
            icon="verified_user"
            items={[
              "No customer data is used to train shared models.",
              "Configurable data retention windows per tenant.",
              "Permanent data erasure upon request or deletion.",
              "Comprehensive audit logging for all data access."
            ]}
          />
          <SecuritySection 
            title="Compliance" 
            icon="balance"
            items={[
              "SOC2 Type II (In Progress) and audit ready.",
              "HIPAA Business Associate Agreements (BAAs) available.",
              "GDPR and CCPA compliant data handling.",
              "Regular third-party security audits and penetration tests."
            ]}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-12 pt-16 border-t border-border-dark">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Subprocessors</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              We maintain a curated list of subprocessors who meet our high security standards. A full list is available upon request.
            </p>
            <a href="mailto:security@linecite.com" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Request List</a>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Data Residency</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              By default, all data is stored and processed within the United States. Regional processing is available for enterprise customers.
            </p>
            <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">US-EAST-1 Default</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Audit Logging</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Every action taken within the platform is logged, including data access, modifications, and export generation events.
            </p>
            <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">Full Audit History</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySection({ title, icon, items }: { title: string, icon: string, items: string[] }) {
  return (
    <div className="p-10 rounded-3xl border border-border-dark bg-background-dark/50 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-8">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-400 text-sm font-medium leading-relaxed">
            <Icon name="check" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
