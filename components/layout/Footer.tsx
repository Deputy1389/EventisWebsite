"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/app")) return null;

  return (
    <footer className="bg-background-dark py-12 text-center text-sm text-slate-500 border-t border-border-dark">
      <div className="px-6 lg:px-40 flex flex-col md:flex-row justify-between items-center gap-8">      
        <div className="flex items-center gap-3">
          <div className="size-6 rounded bg-primary/20 flex items-center justify-center text-primary">  
            <span className="material-symbols-outlined text-[16px]">description</span>
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-white">LineCite</span>     
        </div>

        <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
          <a className="hover:text-white transition-colors" href="#">Privacy</a>
          <a className="hover:text-white transition-colors" href="#">Terms</a>
          <a className="hover:text-white transition-colors" href="#">Security</a>
          <a className="hover:text-white transition-colors" href="#">Contact</a>
        </div>

        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">© 2026 LineCite Intelligence. Deterministic Forensic Engine.</p>
      </div>
    </footer>
  );
}
