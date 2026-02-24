import Link from "next/link";
import {   Shield, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-18 md:pb-24 md:pt-32 bg-[#0F1217]">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#232A34_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="float-in flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#232A34] bg-[#161B22] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A85E]">
            <Shield className="h-3.5 w-3.5" />
            Intelligence Infrastructure for Medical Litigation
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="float-in text-balance text-5xl font-extrabold leading-tight md:text-7xl text-white mb-8">
            The Intelligence Layer for
            <span className="block text-[#C6A85E]"> Medical Litigation.</span>
          </h1>
          <p className="float-in mt-6 text-lg text-[#9CA3AF] md:text-xl leading-relaxed max-w-3xl mx-auto mb-12">
            Surface defense exposure, map causation chains, and generate court-ready intelligence from thousands of pages in minutes.
          </p>
          
          <div className="float-in flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-24">
            <Button size="lg" asChild className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-black h-14 px-8 text-base shadow-2xl shadow-[#C6A85E]/20">
              <Link href="/pilot">
                REQUEST INTELLIGENCE DEMO
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-[#232A34] text-white hover:bg-white/5 h-14 px-8 text-base font-bold">
              <Link href="/sample">
                VIEW SAMPLE INTELLIGENCE BRIEF™
              </Link>
            </Button>
          </div>
        </div>

        {/* Structured UI Animation Placeholder */}
        <div className="float-in relative mx-auto max-w-5xl rounded-2xl border border-[#232A34] bg-[#161B22] p-2 shadow-2xl">
          <div className="rounded-xl border border-[#232A34] bg-[#0F1217] aspect-video flex overflow-hidden">
            <aside className="w-1/4 border-r border-[#232A34] p-4 space-y-4">
              <div className="h-2 w-1/2 bg-[#232A34] rounded" />
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 w-full bg-[#161B22] border border-[#232A34] rounded" />
                ))}
              </div>
            </aside>
            <main className="flex-1 p-6 space-y-6">
              <div className="flex justify-between">
                <div className="h-8 w-1/3 bg-[#232A34] rounded" />
                <div className="h-8 w-1/4 bg-[#C6A85E]/20 rounded border border-[#C6A85E]/30" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-[#161B22] border border-[#232A34] rounded" />
                <div className="h-24 bg-[#161B22] border border-[#232A34] rounded" />
                <div className="h-24 bg-[#161B22] border border-[#232A34] rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-[#161B22] rounded" />
                <div className="h-4 w-5/6 bg-[#161B22] rounded" />
                <div className="h-4 w-4/6 bg-[#161B22] rounded" />
              </div>
            </main>
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-[#C6A85E]/10 blur-3xl" />
          <div className="absolute -top-6 -left-6 h-32 w-32 bg-[#274C77]/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}