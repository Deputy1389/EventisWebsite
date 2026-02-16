import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Network, Database, FileText, ArrowRight } from "lucide-react";

export default function TechPage() {
    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-6">Not a Chatbot. An Ontology Engine.</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        LLMs are great at writing poetry. They are terrible at legal accuracy. Eventis uses a graph-based ontology to ensure every fact is traceable.
                    </p>
                </div>

                {/* The Graph Diagram (CSS/HTML representation) */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="rounded-xl border bg-muted/10 p-12 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 z-10">
                            {/* Nodes */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg mb-4 z-10">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">Document</span>
                            </div>

                            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />

                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg mb-4 z-10">
                                    <Network className="h-8 w-8 text-primary" />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">Event Graph</span>
                            </div>

                            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />

                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg mb-4 z-10">
                                    <Database className="h-8 w-8 text-primary" />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">Structured Output</span>
                            </div>
                        </div>

                        {/* Connecting lines for mobile vertical layout (concept) */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent -z-0" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Simplified view of the Eventis Extraction Pipeline
                    </p>
                </div>

                {/* Deep Dive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">The Ontology Model</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            Eventis models each case as a knowledge graph consisting of <strong>Documents</strong>, <strong>Pages</strong>, <strong>Events</strong>, <strong>Providers</strong>, and <strong>Billing Records</strong>.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            A "Chronology" is simply a projection of this graph: we sort Events by date and render them. This means we can re-project the same data into a "Specials Summary" or a "Provider List" without re-reading the documents.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Missing Record Detection</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            Because we understand the graph, we can find holes in it. If we see a "Referral to Dr. Smith" event on Jan 1st, but no records from Dr. Smith, our graph algorithms flag a "Missing Record" gap.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            This is impossible for standard LLM summarizers, which only look at the text in front of them.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-20">
                    <Button size="lg" asChild>
                        <Link href="/sample">See the Output</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
