"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FolderOpen, LayoutDashboard, LogOut, Scale, Search, Settings, Upload } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/cases", label: "All Matters", icon: FolderOpen },
    { href: "/app/new-case", label: "New Matter", icon: Upload },
  ];

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "LC";

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex h-18 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="rounded-xl bg-sidebar-primary p-2 text-sidebar-primary-foreground">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Linecite</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Command Center</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 space-y-6 px-4 py-5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Find matter..." className="h-9 rounded-xl bg-background/70 pl-8 text-xs" />
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl border bg-background/70 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workflow Hint</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload packet, run extraction, then verify in Audit Mode before export.
          </p>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/app/settings"
          className={cn(
            "mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
            pathname === "/app/settings"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <div className="mb-3 flex items-center gap-3 rounded-xl border bg-background/70 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">{session?.user?.name || "Linecite User"}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email || ""}</p>
          </div>
        </div>

        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

