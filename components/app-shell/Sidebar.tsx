"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Network, LayoutDashboard, FolderOpen, Upload, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { href: "/app", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/cases", label: "All Cases", icon: FolderOpen },
        { href: "/app/new-case", label: "New Case", icon: Upload },
        { href: "/app/settings", label: "Settings", icon: Settings },
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

            <div className="flex-1 py-6 px-4 space-y-1">
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
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t">
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
