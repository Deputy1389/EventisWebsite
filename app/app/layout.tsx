"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Plus } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { terms } from "@/lib/terms";

const navItems = [
  { href: "/app", label: "Dashboard", icon: "dashboard" },
  { href: "/app/cases", label: "All Matters", icon: "folder_open" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "JD";

  // Review pages get a full-bleed layout (no sidebar)
  const isReviewPage = pathname.includes("/review");
  if (isReviewPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      {/* Left Sidebar - fixed */}
      <aside className="fixed left-0 top-0 w-60 h-screen border-r border-border-dark bg-surface-dark flex flex-col z-50">
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b border-border-dark shrink-0">
          <Link href="/app" className="flex items-center gap-2">
            <div className="size-7 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <span className="text-white font-semibold text-sm">{terms.marketing.productName}</span>
          </Link>
        </div>

        {/* New Matter Button */}
        <div className="p-3 border-b border-border-dark shrink-0">
          <Link
            href="/app/new-case"
            className="h-8 w-full bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Matter
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon as any} className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Settings + User */}
        <div className="p-3 border-t border-border-dark shrink-0">
          <Link
            href="/app/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-2 ${
              pathname === "/app/settings"
                ? "text-white bg-white/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon name="settings" className="w-4 h-4" />
            Settings
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-border-dark">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white truncate">{session?.user?.name?.split(" ")[0] || "User"}</span>
                <span className="text-[10px] text-slate-500 truncate">{session?.user?.email || ""}</span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-slate-500 hover:text-white rounded transition-colors shrink-0"
              title="Sign out"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
