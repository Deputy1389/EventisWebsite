import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, BrainCircuit, CheckSquare, FileOutput, ShieldCheck } from "lucide-react";

export default function ProductPage() {
    return (
        <div className="py-20 bg-background-dark min-h-screen">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-4">How It Works</p>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-6">The LineCite Workflow</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        From raw PDF dump to court-ready exhibit in four auditable steps.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-20 max-w-5xl mx-auto">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 order-2 md:order-1">
                            <div className="rounded-xl border border-border-dark bg-surface-dark p-8 h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center text-slate-500">
                                    <Upload className="h-16 w-16 mb-4 opacity-50" />
                                    <span className="font-mono text-sm">Case Upload Interface</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 order-1 md:order-2">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">1</div>
                            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Create Case & Upload</h2>
                            <p className="text-lg text-slate-400 mb-6">
                                Drag and drop gigabytes of medical records. LineCite handles disorganized, scanned, and non-OCR&apos;d PDFs with ease. We automatically index and order documents by date.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-slate-300"><CheckSquare className="h-4 w-4 mr-2 text-primary" /> Supports 5,000+ pages per case</li>
                                <li className="flex items-center text-sm text-slate-300"><CheckSquare className="h-4 w-4 mr-2 text-primary" /> Auto-OCR included</li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">2</div>
                            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Ontology Extraction</h2>
                            <p className="text-lg text-slate-400 mb-6">
                                Unlike generic AI summarizers, LineCite maps records to a strict legal-medical ontology. We identify Providers, Visits, Procedures, and Billing Items as distinct entities.
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="rounded-xl border border-border-dark bg-surface-dark p-8 h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center text-slate-500">
                                    <BrainCircuit className="h-16 w-16 mb-4 opacity-50" />
                                    <span className="font-mono text-sm">Entity Graph Processing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 order-2 md:order-1">
                            <div className="rounded-xl border border-border-dark bg-surface-dark p-8 h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center text-slate-500">
                                    <ShieldCheck className="h-16 w-16 mb-4 opacity-50" />
                                    <span className="font-mono text-sm">Review Dashboard</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 order-1 md:order-2">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">3</div>
                            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Review & Flagging</h2>
                            <p className="text-lg text-slate-400 mb-6">
                                We don&apos;t hide ambiguity. If a date is illegible or a provider is unclear, LineCite flags it as &quot;Needs Review&quot; so your paralegal can verify it instantly against the source page.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">4</div>
                            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Generate Outputs</h2>
                            <p className="text-lg text-slate-400 mb-6">
                                Export a clean, perfectly formatted chronology PDF, a Specials summary, and a Missing Records report in one click.
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="rounded-xl border border-border-dark bg-surface-dark p-8 h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center text-slate-500">
                                    <FileOutput className="h-16 w-16 mb-4 opacity-50" />
                                    <span className="font-mono text-sm">PDF Generation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paralegal First */}
                <div className="mt-32 bg-surface-dark border border-border-dark rounded-2xl p-12 text-center max-w-5xl mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-4">Purpose-Built</p>
                    <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-8">Built for Paralegals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        <div className="p-6 bg-background-dark border border-border-dark rounded-xl">
                            <h3 className="font-bold text-lg text-white mb-2">Clean PDF Export</h3>
                            <p className="text-sm text-slate-400">No weird formatting. Ready to edit, copy, and paste into demand letters.</p>
                        </div>
                        <div className="p-6 bg-background-dark border border-border-dark rounded-xl">
                            <h3 className="font-bold text-lg text-white mb-2">One-Click Citations</h3>
                            <p className="text-sm text-slate-400">Hyperlinks take you straight to the page, even in the PDF export.</p>
                        </div>
                        <div className="p-6 bg-background-dark border border-border-dark rounded-xl">
                            <h3 className="font-bold text-lg text-white mb-2">No Hallucinations</h3>
                            <p className="text-sm text-slate-400">We extract what&apos;s there. We don&apos;t invent narrative. Facts only.</p>
                        </div>
                    </div>
                    <div className="mt-12">
                        <Button size="lg" asChild className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                            <Link href="/pilot">Start Your Pilot</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
