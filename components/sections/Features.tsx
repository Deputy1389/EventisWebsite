import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Calculator, FileWarning, CheckCircle2 } from "lucide-react";

const features = [
    {
        title: "Chronology",
        description: "DOCX or PDF format with per-line citations to the source page.",
        icon: FileText,
        details: ["Sort by date or provider", "Hyperlinked citations", "Editable Word output"]
    },
    {
        title: "Specials Summary",
        description: "Automated billing summary totaling expenses by provider.",
        icon: Calculator,
        details: ["Provider-level aggregation", "Grand total calculation", "Linked invoice pages"]
    },
    {
        title: "Missing Records",
        description: "Automatically flags gaps in dates and missing expected documents.",
        icon: FileWarning,
        details: ["Gap analysis", "Expected document checklist", "Request letter generation aid"]
    }
];

export function Features() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need for your case</h2>
                    <p className="text-lg text-muted-foreground">
                        Stop manually summarizing records. Get audit-ready outputs instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <Card key={feature.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {feature.details.map((detail) => (
                                        <li key={detail} className="flex items-start text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
