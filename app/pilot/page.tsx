"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";      
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

function PilotForm() {
    const searchParams = useSearchParams();
    const [requestType, setRequestType] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setRequestType(searchParams.get("type") || "firm");
    }, [searchParams]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData);
        data.requestType = requestType || "firm";

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
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="py-20 container mx-auto px-4 max-w-md">
                <Card className="text-center py-12 bg-background-dark border-border-dark">
                    <CardContent className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Request Received</h2>
                        <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                            Thanks for your interest in Linecite. Our onboarding team will email you within 24 hours to schedule your {requestType === 'api' ? 'API access' : 'pilot setup'}.  
                        </p>
                        <Button asChild variant="outline" className="border-border-dark hover:bg-surface-dark font-bold uppercase tracking-widest text-xs">
                            <Link href="/">Return Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isApi = requestType === 'api';

    return (
        <div className="py-20 bg-background-dark min-h-screen">
            <div className="container mx-auto px-4 max-w-xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase tracking-[0.2em]">
                        {isApi ? "Request API Access" : "Request Firm Access"}
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        {isApi 
                            ? "Join the platforms building on top of the LineCite evidence engine." 
                            : "Join the leading law firms automating their medical chronology workflow."}
                    </p>
                </div>

                <Card className="bg-background-dark border-border-dark shadow-2xl">
                    <CardHeader className="border-b border-border-dark mb-6">
                        <CardTitle className="text-white uppercase tracking-widest text-sm font-black">Contact Information</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">We&apos;ll use this to set up your secure workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-white text-xs font-bold uppercase tracking-widest">First name</Label>
                                    <Input id="firstName" name="firstName" required placeholder="Jane" className="bg-surface-dark border-border-dark text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-white text-xs font-bold uppercase tracking-widest">Last name</Label>
                                    <Input id="lastName" name="lastName" required placeholder="Doe" className="bg-surface-dark border-border-dark text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white text-xs font-bold uppercase tracking-widest">Work Email</Label>
                                <Input id="email" name="email" type="email" required placeholder={isApi ? "jane@tech.com" : "jane@lawfirm.com"} className="bg-surface-dark border-border-dark text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-white text-xs font-bold uppercase tracking-widest">
                                    {isApi ? "Company / Platform Name" : "Firm Name"}
                                </Label>
                                <Input id="companyName" name="companyName" required placeholder={isApi ? "LegalTech Solutions" : "Doe & Associates"} className="bg-surface-dark border-border-dark text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white text-xs font-bold uppercase tracking-widest">Role</Label>
                                <Select name="role" required>
                                    <SelectTrigger className="bg-surface-dark border-border-dark text-white">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                                        {isApi ? (
                                            <>
                                                <SelectItem value="eng-lead">Engineering Lead</SelectItem>
                                                <SelectItem value="pm">Product Manager</SelectItem>
                                                <SelectItem value="exec">Executive</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="partner">Partner / Attorney</SelectItem>
                                                <SelectItem value="paralegal">Paralegal / Legal Assistant</SelectItem>
                                                <SelectItem value="admin">Firm Administrator</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="volume" className="text-white text-xs font-bold uppercase tracking-widest">
                                    {isApi ? "Estimated Processing Volume" : "Monthly Case Volume (est.)"}
                                </Label>
                                <Select name="volume" required>
                                    <SelectTrigger className="bg-surface-dark border-border-dark text-white">
                                        <SelectValue placeholder="Select volume" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                                        <SelectItem value="low">1-5 {isApi ? 'jobs' : 'cases'}/mo</SelectItem>
                                        <SelectItem value="mid">5-20 {isApi ? 'jobs' : 'cases'}/mo</SelectItem>
                                        <SelectItem value="high">20+ {isApi ? 'jobs' : 'cases'}/mo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-white text-xs font-bold uppercase tracking-widest">Notes or Questions (Optional)</Label>
                                <Textarea id="notes" name="notes" placeholder="Any specific requirements?" className="bg-surface-dark border-border-dark text-white min-h-[100px]" />
                            </div>

                            <Button type="submit" className="w-full font-black uppercase tracking-[0.2em] text-xs h-12 shadow-xl shadow-primary/20" size="lg" disabled={isSubmitting}>
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

export default function PilotPage() {
    return (
        <Suspense fallback={
            <div className="py-20 bg-background-dark min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <PilotForm />
        </Suspense>
    );
}
