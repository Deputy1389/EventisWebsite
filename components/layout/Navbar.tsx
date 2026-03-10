"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/icon";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const requestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (requestRef.current && !requestRef.current.contains(event.target as Node)) {
        setIsRequestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/95 backdrop-blur-md px-6 py-4 lg:px-40">
      <Link href="/" className="flex items-center gap-3 text-white group">
        <div className="flex size-8 items-center justify-center rounded bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          <Icon name="description" className="text-[20px]" />
        </div>
        <h2 className="text-xl font-black tracking-tight uppercase">LineCite</h2>
      </Link>

      <div className="hidden lg:flex items-center gap-10">
        <nav className="flex gap-8">
          <NavLink href="/law-firms" label="Law Firms" active={pathname === "/law-firms"} />
          <NavLink href="/product" label="Product" active={pathname === "/product"} />
          <NavLink href="/developers" label="API" active={pathname === "/developers"} />
          <NavLink href="/tech" label="Methodology" active={pathname === "/tech"} />
          <NavLink href="/security" label="Security" active={pathname === "/security"} />
          <NavLink href="/pricing" label="Pricing" active={pathname === "/pricing"} />
          <NavLink href="/faq" label="FAQ" active={pathname === "/faq"} />
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/auth/signin" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Sign In</Link>
          
          <div className="relative" ref={requestRef}>
            <button 
              onClick={() => setIsRequestOpen(!isRequestOpen)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark shadow-lg shadow-primary/10 active:scale-95"
            >
              Request Access
              <ChevronDown size={14} className={`transition-transform ${isRequestOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRequestOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-dark bg-surface-dark p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[60]">
                <Link 
                  href="/pilot?type=firm" 
                  className="flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setIsRequestOpen(false)}
                >
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Firm Access</span>
                  <span className="text-[10px] text-slate-500 uppercase">For law firms</span>
                </Link>
                <Link 
                  href="/pilot?type=api" 
                  className="flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors mt-1"
                  onClick={() => setIsRequestOpen(false)}
                >
                  <span className="text-xs font-bold text-white uppercase tracking-wider">API Access</span>
                  <span className="text-[10px] text-slate-500 uppercase">For developers</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="lg:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface-dark border-b border-border-dark p-6 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            <Link href="/law-firms" className="text-sm font-bold text-slate-300">Law Firms</Link>
            <Link href="/product" className="text-sm font-bold text-slate-300">Product</Link>
            <Link href="/developers" className="text-sm font-bold text-slate-300">API</Link>
            <Link href="/tech" className="text-sm font-bold text-slate-300">Methodology</Link>
            <Link href="/security" className="text-sm font-bold text-slate-300">Security</Link>
            <Link href="/pricing" className="text-sm font-bold text-slate-300">Pricing</Link>
            <Link href="/faq" className="text-sm font-bold text-slate-300">FAQ</Link>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-border-dark">
            <Link href="/auth/signin" className="text-center text-xs font-black uppercase text-slate-500">Sign In</Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/pilot?type=firm" className="h-12 bg-surface-light flex items-center justify-center rounded-xl font-black uppercase text-[10px] tracking-widest text-white border border-border-dark">Firm Access</Link>
              <Link href="/pilot?type=api" className="h-12 bg-primary flex items-center justify-center rounded-xl font-black uppercase text-[10px] tracking-widest text-white">API Access</Link>
            </div>
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
