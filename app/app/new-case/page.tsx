"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseApiError } from "@/lib/api-error";
import { uploadMatterDocument } from "@/lib/document-upload";

type CreatedMatter = {
  id: string;
};

export default function NewCasePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [newCaseId, setNewCaseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Auto-generate case name from filename if not provided
    let finalCaseName = caseName;
    if (!finalCaseName) {
      // Remove file extension and clean up the filename
      finalCaseName = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[_-]/g, " ")    // Replace underscores and dashes with spaces
        .replace(/\s+/g, " ")     // Normalize multiple spaces
        .trim();

      // Set the case name field so user can see what was auto-generated
      setCaseName(finalCaseName);
    }

    setIsProcessing(true);

    try {
      // Use firmId from session if available, otherwise fetch from API
      let firmId = session?.user?.firmId;

      if (!firmId) {
        const firmsRes = await fetch("/api/citeline/firms");
        if (!firmsRes.ok) {
          throw new Error("Failed to fetch firms");
        }
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) {
          throw new Error("No firms found. Please contact support.");
        }
        firmId = firms[0].id;
      }

      const matterRes = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finalCaseName }),
      });

      if (!matterRes.ok) {
        const errorText = await matterRes.text();
        const errorMessage = parseApiError(errorText);
        throw new Error(`Failed to create matter: ${errorMessage}`);
      }

      const matter: CreatedMatter = await matterRes.json();
      const matterId = matter.id;
      setNewCaseId(matterId);

      await uploadMatterDocument(matterId, file);

      // 3. Trigger extraction run
      console.log("Triggering extraction run...");
      const runRes = await fetch(`/api/citeline/matters/${matterId}/runs`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!runRes.ok) {
        console.error("Failed to trigger extraction:", await runRes.text());
        // We don't throw here so the user at least sees the upload worked
      }

      setIsDone(true);
      toast.success("Case created and file uploaded!");

      // Auto-redirect into command center (Audit Mode)
      setTimeout(() => {
        router.push(`/app/cases/${matterId}/review`);
      }, 2000);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Something went wrong during upload";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }

  function triggerFileSelect() {
    // Allow file selection even without case name - will auto-generate from filename
    fileInputRef.current?.click();
  }

  if (isDone) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Upload Complete</h2>
        <p className="text-muted-foreground mb-8">
          &ldquo;{caseName}&rdquo; has been created and your records are uploaded.
          <br />Redirecting you to Audit Mode...
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href={`/app/cases/${newCaseId}/review`}>Open Audit Mode</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
        <p className="text-muted-foreground">Upload medical records to begin extraction.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>Enter the basic information for this matter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caseName">Case Name / Matter Reference <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="caseName"
              placeholder="Leave blank to auto-generate from filename"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
            />
          </div>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileChange}
          />

          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={triggerFileSelect}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Uploading & Analyzing...</h3>
                <p className="text-sm text-muted-foreground">This may take a moment.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-1">Upload Medical Records</h3>
                <p className="text-sm text-muted-foreground mb-4">PDF files supported.</p>
                <Button variant="secondary" type="button">Select PDF File</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
