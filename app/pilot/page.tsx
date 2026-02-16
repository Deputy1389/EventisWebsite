"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PilotPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("/api/pilot-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to submit");

            setIsSuccess(true);
            toast.success("Request received! We'll be in touch shortly.");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="py-20 container mx-auto px-4 max-w-md">
                <Card className="text-center py-12">
                    <CardContent className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Request Received</h2>
                        <p className="text-muted-foreground mb-6">
                            Thanks for your interest in Eventis. Our onboarding team will email you within 24 hours to schedule your pilot setup.
                        </p>
                        <Button asChild variant="outline">
                            <a href="/">Return Home</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="py-20">
            <div className="container mx-auto px-4 max-w-xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Request a Pilot</h1>
                    <p className="text-lg text-muted-foreground">
                        Join the leading law firms automating their medical chronology workflow.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>We'll use this to set up your secure workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" name="firstName" required placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" name="lastName" required placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Work Email</Label>
                                <Input id="email" name="email" type="email" required placeholder="jane@lawfirm.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firmName">Firm Name</Label>
                                <Input id="firmName" name="firmName" required placeholder="Doe & Associates" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="partner">Partner / Attorney</SelectItem>
                                        <SelectItem value="paralegal">Paralegal / Legal Assistant</SelectItem>
                                        <SelectItem value="admin">Firm Administrator</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="volume">Monthly Case Volume (est.)</Label>
                                <Select name="volume" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select volume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-5">1-5 cases/mo</SelectItem>
                                        <SelectItem value="5-20">5-20 cases/mo</SelectItem>
                                        <SelectItem value="20+">20+ cases/mo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes or Questions (Optional)</Label>
                                <Textarea id="notes" name="notes" placeholder="Any specific requirements?" />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Submit Request"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
