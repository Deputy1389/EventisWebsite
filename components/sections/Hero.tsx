import Link from "next/link";
import { Zap, ArrowRight, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-48 bg-[#0F1217]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#232A34_1px,transparent_1px)] [background-size:32px:32px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#C6A85E]/5 rounded-full blur-[120px] -z-10" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="float-in flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#C6A85E]/20 bg-[#C6A85E]/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#C6A85E]">
            <Zap className="h-4 w-4 fill-[#C6A85E]" />
            Deterministic Intelligence Layer for Litigation
          </div>
        </div>

        <div className="text-center max-w-5xl mx-auto">
          <h1 className="float-in text-balance text-6xl font-serif leading-[1.1] md:text-8xl text-white mb-10 tracking-tight">
            The Truth in <br />
            <span className="text-[#C6A85E] italic font-medium">Every Single Page.</span>
          </h1>
          <p className="float-in mt-8 text-xl text-slate-400 md:text-2xl leading-relaxed max-w-3xl mx-auto mb-16 font-light">
            Linecite transforms messy medical records into structured, citeable evidence graphs. 
            Automate your chronologies with <span className="text-white font-medium">100% auditability</span> for every extracted fact.
          </p>

          <div className="float-in flex flex-col items-center gap-6 sm:flex-row sm:justify-center mb-32">
            <Button size="lg" asChild className="bg-[#C6A85E] hover:bg-[#B08D4A] text-black font-black h-16 px-12 text-lg rounded-xl shadow-2xl shadow-[#C6A85E]/20">
              <Link href="/pilot">
                START YOUR ANALYSIS <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="text-slate-400 hover:text-white hover:bg-white/5 h-16 px-10 text-lg font-bold">
              <Link href="/sample">
                VIEW SAMPLE BRIEF™
              </Link>
            </Button>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="float-in relative mx-auto max-w-6xl rounded-[32px] border border-[#232A34] bg-[#161B22]/80 backdrop-blur-xl p-3 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="rounded-[24px] border border-[#232A34] bg-[#0F1217] aspect-[16/9] flex overflow-hidden shadow-inner">
            <aside className="w-1/4 border-r border-[#232A34] p-6 space-y-6 bg-[#0F1217]">
              <div className="flex items-center gap-2 mb-8">
                <Activity size={16} className="text-[#C6A85E]" />
                <div className="h-2 w-24 bg-[#232A34] rounded-full" />
              </div>
              <div className="space-y-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`h-12 w-full rounded-xl border transition-all ${i === 2 ? 'bg-[#C6A85E]/10 border-[#C6A85E]/30' : 'bg-[#161B22] border-[#232A34]'}`} />  
                ))}
              </div>
            </aside>
            <main className="flex-1 p-10 space-y-10">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="h-2 w-32 bg-[#232A34] rounded-full" />
                  <div className="h-10 w-64 bg-white/5 rounded-xl" />
                </div>
                <div className="flex gap-4">
                   <div className="h-16 w-24 bg-[#C6A85E]/10 rounded-2xl border border-[#C6A85E]/20" />
                   <div className="h-16 w-24 bg-[#274C77]/10 rounded-2xl border border-[#274C77]/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-32 bg-[#161B22] border border-[#232A34] rounded-2xl shadow-lg" />
                <div className="h-32 bg-[#161B22] border border-[#232A34] rounded-2xl shadow-lg" />
                <div className="h-32 bg-[#161B22] border border-[#232A34] rounded-2xl shadow-lg" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-white/5 rounded-full" />
                <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                <div className="h-4 w-4/6 bg-white/5 rounded-full" />
              </div>
            </main>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-[#C6A85E]/10 blur-[100px] -z-10" />
          <div className="absolute -top-10 -left-10 h-64 w-64 bg-[#274C77]/10 blur-[100px] -z-10" />
        </div>
      </div>
    </section>
  );
}
