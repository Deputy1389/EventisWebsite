"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function NewCasePage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // Mock processing simulation
    function handleUpload() {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsDone(true);
        }, 2000);
    }

    if (isDone) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Upload Complete</h2>
                <p className="text-muted-foreground mb-8">
                    "Doe v. Smith" is now being processed. You will receive an email when the logs are ready (est. 15 mins).
                </p>
                <Button asChild>
                    <Link href="/app">Back to Dashboard</Link>
                </Button>
            </div>
        )
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
                        <Input id="caseName" placeholder="e.g. Doe v. Smith" />
                    </div>

                    <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleUpload}>
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
                                <p className="text-sm text-muted-foreground mb-4">PDF, ZIP, or folders supported.</p>
                                <Button variant="secondary">Select Files</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
