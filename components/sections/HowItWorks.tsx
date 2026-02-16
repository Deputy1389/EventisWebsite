import { ArrowRight } from "lucide-react";

export function HowItWorks() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
                    <p className="text-lg text-muted-foreground">From PDF to analysis in three simple steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-border -z-10" />

                    {[
                        { step: 1, title: "Upload Records", desc: "Drag and drop your medical record PDFs. Eventis supports thousands of pages per case." },
                        { step: 2, title: "AI Processing", desc: "Our ontology engine extracts events, providers, and billing items, linking them to source pages." },
                        { step: 3, title: "Download Outputs", desc: "Receive your Chronology (DOCX), Specials, and Missing Records reports immediately." }
                    ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center text-center bg-background p-6 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-6 shadow-sm z-10">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
