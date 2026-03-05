"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/app")) return null;

  return (
    <footer className="bg-background-dark py-16 border-t border-border-dark">
      <div className="px-6 lg:px-40 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 text-white mb-6">
              <div className="flex size-8 items-center justify-center rounded bg-primary text-white">
                <Icon name="description" className="text-[20px]" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase">LineCite</h2>
            </Link>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
              Deterministic medical evidence extraction and citation resolution for high-stakes litigation and platform integrations.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/law-firms" className="text-sm text-slate-500 hover:text-white transition-colors">Law Firms</Link></li>
              <li><Link href="/developers" className="text-sm text-slate-500 hover:text-white transition-colors">API / Developers</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/tech" className="text-sm text-slate-500 hover:text-white transition-colors">Methodology</Link></li>
              <li><Link href="/security" className="text-sm text-slate-500 hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-500 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:support@linecite.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
            © 2026 LineCite Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
