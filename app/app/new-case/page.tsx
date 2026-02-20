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

    if (!caseName) {
      toast.error("Please enter a case name first");
      return;
    }

    const firmId = session?.user?.firmId;
    if (!firmId) {
      toast.error("You must be logged in with a firm to create a case");
      return;
    }

    setIsProcessing(true);

    try {
      const matterRes = await fetch(`/api/citeline/firms/${firmId}/matters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: caseName }),
      });

      if (!matterRes.ok) {
        const error = await matterRes.text();
        throw new Error(`Failed to create matter: ${error}`);
      }

      const matter: CreatedMatter = await matterRes.json();
      const matterId = matter.id;
      setNewCaseId(matterId);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`/api/citeline/matters/${matterId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.text();
        throw new Error(`Failed to upload document: ${error}`);
      }

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
      
      // Auto-redirect after a short delay
      setTimeout(() => {
        router.push(`/app/cases/${matterId}`);
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
    if (!caseName) {
      toast.error("Please enter a case name first");
      return;
    }
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
          <br />Redirecting you to case details...
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href={`/app/cases/${newCaseId}`}>View Case Details</Link>
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
            <Label htmlFor="caseName">Case Name / Matter Reference</Label>
            <Input
              id="caseName"
              placeholder="e.g. Doe v. Smith"
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
