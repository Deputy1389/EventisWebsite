import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export function Pricing() {
    return (
        <section className="py-20" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, per-case pricing</h2>
                    <p className="text-lg text-muted-foreground">No subscriptions. Pay only for the cases you process.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Chronology Only</CardTitle>
                            <CardDescription>Perfect for simple cases</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-4xl font-bold mb-6">$150<span className="text-lg font-normal text-muted-foreground">/case</span></div>
                            <ul className="space-y-3">
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Medical Chronology (DOCX/PDF)</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Hyperlinked Citations</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Up to 500 pages</li>
                                <li className="flex items-center text-muted-foreground"><Check className="h-4 w-4 mr-2 opacity-50" /> Specials Summary</li>
                                <li className="flex items-center text-muted-foreground"><Check className="h-4 w-4 mr-2 opacity-50" /> Missing Records Report</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link href="/pilot">Request Pilot</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                            POPULAR
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl">Complete Case</CardTitle>
                            <CardDescription>Everything needed for demand letters</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-4xl font-bold mb-6">$250<span className="text-lg font-normal text-muted-foreground">/case</span></div>
                            <ul className="space-y-3">
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Medical Chronology (DOCX/PDF)</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Hyperlinked Citations</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Specials Summary</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Missing Records Report</li>
                                <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Up to 1000 pages</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="default" asChild>
                                <Link href="/pilot">Request Pilot</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Pricing shown for pilots. Volume pricing available for enterprise firms.
                </p>
            </div>
        </section>
    );
}
