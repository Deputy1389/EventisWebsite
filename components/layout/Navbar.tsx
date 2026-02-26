"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/95 backdrop-blur-md px-6 py-4 lg:px-40">
      <Link href="/" className="flex items-center gap-3 text-white group">
        <div className="flex size-8 items-center justify-center rounded bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[20px]">description</span>
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase">LineCite</h2>
      </Link>

      <div className="hidden lg:flex items-center gap-10">
        <nav className="flex gap-8">
          <NavLink href="/tech" label="Methodology" active={pathname === "/tech"} />
          <NavLink href="/security" label="Security" active={pathname === "/security"} />
          <NavLink href="/sample" label="Output" active={pathname === "/sample"} />
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Sign In</Link>
          <Link href="/pilot">
            <button className="flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark shadow-lg shadow-primary/10 active:scale-95">Request Access</button>
          </Link>
        </div>
      </div>

      <button className="lg:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface-dark border-b border-border-dark p-6 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            <Link href="/tech" className="text-sm font-bold text-slate-300">Methodology</Link>
            <Link href="/security" className="text-sm font-bold text-slate-300">Security</Link>
            <Link href="/sample" className="text-sm font-bold text-slate-300">Output Preview</Link>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-border-dark">
            <Link href="/auth/signin" className="text-center text-xs font-black uppercase text-slate-500">Sign In</Link>
            <Link href="/pilot" className="w-full h-12 bg-primary flex items-center justify-center rounded-xl font-black uppercase text-xs tracking-widest text-white">Request Access</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, active }: { href: string, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${active ? 'text-primary' : 'text-slate-500 hover:text-slate-200'}`}
    >
      {label}
    </Link>
  );
}
