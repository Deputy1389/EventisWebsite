"use client";

import { use } from "react";
import { ChevronLeft, FileText, Search, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const mockEvents = [
  { id: "1", date: "2023-01-15", type: "ED Visit", text: "Patient presented with severe back pain after MVA.", page: 42, confidence: 98 },
  { id: "2", date: "2023-01-15", type: "Imaging", text: "CT Cervical Spine: No acute fracture, degenerative changes at C5-C6.", page: 48, confidence: 95 },
  { id: "3", date: "2023-01-18", type: "Clinical", text: "Ortho eval: ROM limited in flexion. Prescribed physical therapy.", page: 112, confidence: 88 },
];

export default function ReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);

  return (
    <div className="h-screen flex flex-col -m-8 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/cases/${caseId}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Audit Mode: Smith v. State Farm
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase">Drafting Ready</Badge>
          <Button size="sm">Export Final DOCX</Button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Extraction List */}
        <div className="w-[450px] border-r bg-muted/10 flex flex-col shrink-0">
          <div className="p-4 border-b bg-background/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                className="w-full bg-background border rounded-md py-2 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Search extracted facts..."
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {mockEvents.map((e) => (
                <Card key={e.id} className="cursor-pointer hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{e.date}</span>
                      <Badge variant="secondary" className="text-[9px] h-4">{e.type}</Badge>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2">{e.text}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-primary group-hover:underline flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Source p. {e.page}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${e.confidence}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{e.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Document Viewer */}
        <div className="flex-1 bg-muted/30 flex flex-col items-center justify-center p-12">
          <div className="w-full max-w-2xl aspect-[1/1.4] bg-background shadow-2xl rounded-sm border flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="font-bold text-lg mb-2">Source Document Preview</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              This area will host the high-fidelity PDF viewer, auto-scrolling to the relevant page and bounding box when an event is selected.
            </p>
            <div className="mt-8 flex gap-2">
              <div className="h-2 w-32 bg-muted rounded animate-pulse" />
              <div className="h-2 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="mt-2 flex gap-2">
              <div className="h-2 w-40 bg-muted rounded animate-pulse" />
              <div className="h-2 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Helper overlay */}
          <div className="mt-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-[10px] font-medium flex items-center gap-2 shadow-lg">
            <Info className="h-3 w-3" />
            Click an event on the left to verify the source text instantly.
          </div>
        </div>
      </div>
    </div>
  );
}
