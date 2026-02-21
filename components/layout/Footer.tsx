"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Scale } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/app")) return null;

  return (
    <footer className="border-t bg-secondary/35">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="rounded-xl bg-primary p-2 text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Linecite</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">By Ontarus</p>
            </div>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Record-faithful legal analytics for medical chronologies, specials, and missing-record strategy.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Platform</p>
          <Link href="/product" className="block hover:text-primary">Workflow</Link>
          <Link href="/sample" className="block hover:text-primary">Sample Output</Link>
          <Link href="/pilot" className="block hover:text-primary">Pilot Intake</Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Trust</p>
          <Link href="/security" className="block hover:text-primary">Security</Link>
          <Link href="/tech" className="block hover:text-primary">Technical Method</Link>
          <a href="mailto:pilot@ontarus.ai" className="inline-flex items-center gap-1 hover:text-primary">
            Contact <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Legal</p>
          <span className="block text-muted-foreground">SOC2 Type II roadmap in progress</span>
          <span className="block text-muted-foreground">BAA available for pilot customers</span>
          <span className="block text-muted-foreground">HIPAA-aware deployment controls</span>
        </div>
      </div>

      <div className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        Copyright {new Date().getFullYear()} Ontarus, Inc. All rights reserved.
      </div>
    </footer>
  );
}

