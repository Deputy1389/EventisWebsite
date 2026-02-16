import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

export function Hero() {
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground mb-6 bg-background/50 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                    Now onboarding pilot partners
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight">
                    Court-ready medical chronologies <span className="text-primary">in minutes.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    Eventis turns medical record PDFs into a structured event graph, then generates chronologies, specials, and missing-records reports with citations back to the source page.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6" asChild>
                        <Link href="/pilot">
                            Request Pilot <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6" asChild>
                        <Link href="/sample">
                            <FileText className="mr-2 h-4 w-4" /> View Sample Output
                        </Link>
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t max-w-sm mx-auto flex justify-center gap-8 text-sm text-muted-foreground">
                    <div>
                        <span className="font-bold text-foreground block text-lg">99%+</span>
                        Accuracy
                    </div>
                    <div>
                        <span className="font-bold text-foreground block text-lg">10x</span>
                        Faster
                    </div>
                    <div>
                        <span className="font-bold text-foreground block text-lg">SOC2</span>
                        Planned
                    </div>
                </div>
            </div>
        </section>
    );
}
