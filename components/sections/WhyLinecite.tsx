import { ShieldCheck, Link2, Search } from "lucide-react";

export function WhyLinecite() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Why law firms trust Linecite</h2>
                    <p className="text-lg text-muted-foreground">Built for accuracy, auditability, and speed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-start">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                            <Link2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Verifiable Citations</h3>
                        <p className="text-muted-foreground">Every extracted event links directly to the source document page (and bounding box), so you can verify facts instantly.</p>
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Deterministic Extraction</h3>
                        <p className="text-muted-foreground">We don&apos;t summarize loosely. Our engine extracts structured data points deterministically, ensuring fidelity to the record.</p>
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Audit Trail</h3>
                        <p className="text-muted-foreground">Confidence scores for every extraction and &quot;Needs Review&quot; flags for ambiguous items ensure you are always in control.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
