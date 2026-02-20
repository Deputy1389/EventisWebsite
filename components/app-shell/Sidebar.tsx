"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Network, LayoutDashboard, FolderOpen, Upload, Settings, LogOut, Search, Clock8 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Input } from "@/components/ui/input";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { href: "/app", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/cases", label: "All Matters", icon: FolderOpen },
        { href: "/app/new-case", label: "New Matter", icon: Upload },
    ];

    const recentMatters = [
        { id: "1", name: "Smith v. State Farm" },
        { id: "2", name: "Doe v. Mercy" },
    ];

    const userInitials = session?.user?.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "??";

    return (
        <div className="w-64 border-r bg-muted/20 flex flex-col h-screen sticky top-0">
            <div className="h-16 flex items-center justify-between px-6 border-b">
                <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
                    <Network className="h-6 w-6" />
                    <span>Linecite</span>
                </Link>
                <ThemeToggle />
            </div>

            <div className="flex-1 py-6 px-4 space-y-6">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Find matter..." className="pl-7 h-8 text-xs bg-background/50" />
                </div>

                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="pt-4">
                    <div className="px-3 mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        <Clock8 className="mr-2 h-3 w-3" /> Recent
                    </div>
                    <div className="space-y-1">
                        {recentMatters.map((m) => (
                            <Link
                                key={m.id}
                                href={`/app/cases/${m.id}`}
                                className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors truncate"
                            >
                                {m.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t">
                <Link
                    href="/app/settings"
                    className={cn(
                        "flex items-center space-x-3 px-3 py-2 mb-2 rounded-md text-sm font-medium transition-colors",
                        pathname === "/app/settings"
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </Link>
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {userInitials}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{session?.user?.name ?? "User"}</span>
                        <span className="text-xs text-muted-foreground">{session?.user?.email ?? ""}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
            </div>
        </div>
    );
}
