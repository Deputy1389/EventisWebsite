import { Sidebar } from "@/components/app-shell/Sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="relative flex-1 overflow-auto p-6 md:p-8">
                <div className="pointer-events-none absolute inset-0 fancy-grid opacity-20" />
                <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                {children}
            </main>
        </div>
    );
}
