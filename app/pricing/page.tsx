"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PLANS = {
  STARTER: "price_starter_placeholder",
  PRO: "price_pro_placeholder",
};

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const onCheckout = async (priceId: string) => {
    try {
      setLoadingPriceId(priceId);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <main className="flex-1">
        <section className="px-6 py-20 lg:px-40 lg:py-32 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-5xl font-black text-white lg:text-7xl mb-8 uppercase tracking-widest">Pricing for Law Firms and Platforms</h1>
            <p className="text-xl text-slate-400 font-medium">Transparent, usage-based pricing designed for growth and scale.</p>
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-40 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Litigation Software</h2>
            <h3 className="text-3xl font-black text-white lg:text-5xl uppercase tracking-widest">Law Firm Plans</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            <PricingCard 
              title="Starter" 
              price="$499" 
              period="/mo"
              description="For smaller PI firms handling selective cases."
              features={[
                "Up to 5 matters / mo",
                "Standard chronology export",
                "Audit mode included",
                "Email support"
              ]}
              cta="Subscribe Now"
              onClick={() => onCheckout(PLANS.STARTER)}
              isLoading={loadingPriceId === PLANS.STARTER}
            />
            <PricingCard 
              title="Pro" 
              price="$1,499" 
              period="/mo"
              description="For high-volume firms and med-mal practice areas."
              features={[
                "Up to 20 matters / mo",
                "Priority processing queue",
                "Expert binder generation",
                "Advanced gap reporting",
                "Priority email support"
              ]}
              highlighted
              cta="Subscribe Now"
              onClick={() => onCheckout(PLANS.PRO)}
              isLoading={loadingPriceId === PLANS.PRO}
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              description="For large multi-office firms with custom needs."
              features={[
                "Unlimited matters",
                "Custom data retention",
                "Dedicated account manager",
                "SSO and advanced security",
                "24/7 priority support"
              ]}
              cta="Talk to Sales"
              href="mailto:patrick@linecite.com"
            />
          </div>

          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Platform Infrastructure</h2>
            <h3 className="text-3xl font-black text-white lg:text-5xl uppercase tracking-widest">API Pricing</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 rounded-2xl border border-border-dark bg-background-dark/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
              <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">Usage Based</h4>
              <p className="text-slate-500 mb-8">Priced per page or per job with granular volume tiers.</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Icon name="check" className="w-4 h-4 text-primary" />
                  <span>No upfront fees or commitments</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Icon name="check" className="w-4 h-4 text-primary" />
                  <span>Automatic volume discounts</span>
                </li>
              </ul>
              <Link href="/pilot?type=api" className="inline-block text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                Request API Access <Icon name="chevron_right" className="w-4 h-4 inline-block ml-1" />
              </Link>
            </div>
            
            <div className="p-10 rounded-2xl border border-border-dark bg-background-dark/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
              <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">Platform Enterprise</h4>
              <p className="text-slate-500 mb-8">For high-scale integrations requiring custom contracts.</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Icon name="check" className="w-4 h-4 text-primary" />
                  <span>Annual volume commitments</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Icon name="check" className="w-4 h-4 text-primary" />
                  <span>Custom SLAs and performance tiers</span>
                </li>
              </ul>
              <Link href="mailto:patrick@linecite.com" className="inline-block text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                Talk to Engineering <Icon name="chevron_right" className="w-4 h-4 inline-block ml-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  period,
  description, 
  features, 
  highlighted, 
  cta, 
  href,
  onClick,
  isLoading
}: { 
  title: string, 
  price: string, 
  period?: string,
  description: string, 
  features: string[],
  highlighted?: boolean,
  cta: string,
  href?: string,
  onClick?: () => void,
  isLoading?: boolean
}) {
  return (
    <div className={`p-10 rounded-3xl border ${highlighted ? "border-primary shadow-2xl shadow-primary/10" : "border-border-dark"} bg-background-dark/50 flex flex-col`}>
      <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black text-white uppercase tracking-tighter">{price}</span>
        {period && <span className="text-slate-500 text-sm font-bold uppercase">{period}</span>}
      </div>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed">{description}</p>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-400 text-xs font-medium uppercase tracking-widest">
            <Icon name="check" className="w-4 h-4 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {href ? (
        <Link href={href} className={`block w-full text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${highlighted ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark" : "bg-surface-dark text-white border border-border-dark hover:bg-white/5"}`}>
          {cta}
        </Link>
      ) : (
        <button 
          onClick={onClick}
          disabled={isLoading}
          className={`w-full text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${highlighted ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark" : "bg-surface-dark text-white border border-border-dark hover:bg-white/5"}`}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {cta}
        </button>
      )}
    </div>
  );
}
