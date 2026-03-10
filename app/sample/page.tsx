import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Calculator, FileWarning } from "lucide-react";
import Link from "next/link";

const mockChronology = [
    { date: "2023-01-15", provider: "Mercy General Hospital", event: "Emergency Department Visit", description: "Pt presents with severe neck pain following MVA. CT Scan ordered.", source: "p. 42" },
    { date: "2023-01-15", provider: "Mercy General Hospital", event: "Imaging - CT Cervical Spine", description: "No acute fracture. Mild degenerative changes at C5-C6.", source: "p. 48" },
    { date: "2023-01-18", provider: "Dr. Smith Orthopedics", event: "Initial Evaluation", description: "Pt reports continued stiffness. ROM limited in flexion/extension. Prescribed PT.", source: "p. 112" },
    { date: "2023-01-25", provider: "Valley Physical Therapy", event: "Therapy Session (1/12)", description: "Initial assessment. Pt tolerated manual therapy well.", source: "p. 156" },
    { date: "2023-02-14", provider: "Dr. Smith Orthopedics", event: "Follow-up", description: "Pt reports 50% improvement. Continuing PT for 4 more weeks.", source: "p. 115" },
];

export default function SamplePage() {
    return (
        <div className="py-20 bg-background-dark min-h-screen">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-4">Output Preview</p>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-6">See the Output</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        LineCite produces structured, audit-ready reports. Here is a preview of the Medical Chronology format.
                    </p>
                </div>

                {/* Mock Table */}
                <div className="max-w-5xl mx-auto border border-border-dark rounded-xl overflow-hidden mb-16">
                    <div className="bg-surface-dark px-6 py-4 border-b border-border-dark flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Chronology Preview
                        </h3>
                        <span className="text-xs text-slate-500 bg-background-dark px-2 py-1 rounded border border-border-dark">DOE, John - Case #24-991</span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border-dark">
                                <TableHead className="w-[120px] text-slate-400">Date</TableHead>
                                <TableHead className="w-[200px] text-slate-400">Provider</TableHead>
                                <TableHead className="w-[200px] text-slate-400">Event Type</TableHead>
                                <TableHead className="text-slate-400">Description</TableHead>
                                <TableHead className="w-[80px] text-right text-slate-400">Source</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockChronology.map((row, index) => (
                                <TableRow key={index} className="border-border-dark">
                                    <TableCell className="font-medium whitespace-nowrap text-white">{row.date}</TableCell>
                                    <TableCell className="text-slate-300">{row.provider}</TableCell>
                                    <TableCell className="text-slate-300">{row.event}</TableCell>
                                    <TableCell className="text-slate-400">{row.description}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-primary text-xs">{row.source}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="bg-surface-dark/50 px-6 py-4 border-t border-border-dark text-center text-sm text-slate-500">
                        Showing 5 of 142 events extracted from 450 pages.
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-border-dark bg-surface-dark rounded-xl p-6 flex flex-col items-center gap-2 opacity-60">
                        <FileText className="h-8 w-8 text-primary mb-1" />
                        <span className="font-bold text-white">Chronology (PDF)</span>
                        <span className="text-xs text-slate-500 font-normal">Sample downloads coming soon</span>
                    </div>
                    <div className="border border-border-dark bg-surface-dark rounded-xl p-6 flex flex-col items-center gap-2 opacity-60">
                        <Calculator className="h-8 w-8 text-primary mb-1" />
                        <span className="font-bold text-white">Specials Summary</span>
                        <span className="text-xs text-slate-500 font-normal">Sample downloads coming soon</span>
                    </div>
                    <div className="border border-border-dark bg-surface-dark rounded-xl p-6 flex flex-col items-center gap-2 opacity-60">
                        <FileWarning className="h-8 w-8 text-primary mb-1" />
                        <span className="font-bold text-white">Missing Records</span>
                        <span className="text-xs text-slate-500 font-normal">Sample downloads coming soon</span>
                    </div>
                </div>

                <div className="text-center mt-16">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-6">Ready to try it on your own files?</h3>
                    <Button size="lg" asChild className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        <Link href="/pilot">Request a Free Pilot</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
