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
        <div className="py-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-6">See the Output</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Linecite produces structured, audit-ready reports. Here is a preview of the Medical Chronology format.
                    </p>
                </div>

                {/* Mock Table */}
                <div className="max-w-5xl mx-auto border rounded-xl shadow-sm overflow-hidden mb-16">
                    <div className="bg-muted px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Chronology Preview
                        </h3>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">DOE, John - Case #24-991</span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead className="w-[200px]">Provider</TableHead>
                                <TableHead className="w-[200px]">Event Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[80px] text-right">Source</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockChronology.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium whitespace-nowrap">{row.date}</TableCell>
                                    <TableCell>{row.provider}</TableCell>
                                    <TableCell>{row.event}</TableCell>
                                    <TableCell className="text-muted-foreground">{row.description}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-primary hover:underline cursor-pointer text-xs">{row.source}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="bg-muted/30 px-6 py-4 border-t text-center text-sm text-muted-foreground">
                        Showing 5 of 142 events extracted from 450 pages.
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" asChild>
                        <Link href="/sample/chronology_sample.docx" target="_blank">
                            <FileText className="h-8 w-8 text-primary mb-1" />
                            <span className="font-bold">Chronology (DOCX)</span>
                            <span className="text-xs text-muted-foreground font-normal">Editable Word Document</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" asChild>
                        <Link href="/sample/specials_sample.pdf" target="_blank">
                            <Calculator className="h-8 w-8 text-primary mb-1" />
                            <span className="font-bold">Specials Summary</span>
                            <span className="text-xs text-muted-foreground font-normal">Billing Ledger PDF</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" asChild>
                        <Link href="/sample/missing_records_sample.pdf" target="_blank">
                            <FileWarning className="h-8 w-8 text-primary mb-1" />
                            <span className="font-bold">Missing Records</span>
                            <span className="text-xs text-muted-foreground font-normal">Gap Analysis Report</span>
                        </Link>
                    </Button>
                </div>

                <div className="text-center mt-16">
                    <h3 className="text-2xl font-bold mb-6">Ready to try it on your own files?</h3>
                    <Button size="lg" asChild>
                        <Link href="/pilot">Request a Free Pilot</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
