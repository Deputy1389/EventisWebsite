"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scale } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/product", label: "Platform" },
  { href: "/tech", label: "Methodology" },
  { href: "/security", label: "Security" },
  { href: "/sample", label: "Output Preview" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-2 text-foreground">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/20 transition group-hover:translate-y-[-1px]">
            <Scale className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">Linecite</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Litigation Intelligence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link href="/pilot">Book Pilot</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block text-lg",
                      pathname === link.href ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="space-y-2 pt-3">
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/pilot">Book Pilot</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

