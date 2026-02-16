import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How accurate are the chronologies?</AccordionTrigger>
                        <AccordionContent>
                            Eventis uses a deterministic extraction approach combined with human-in-the-loop review tools. We achieve 99% accuracy on structured data points. Any ambiguous entries are flagged for your review.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Is my client data secure?</AccordionTrigger>
                        <AccordionContent>
                            Yes. We use AES-256 encryption at rest and TLS 1.3 in transit. We do not train our models on your client data. All data is processed in a secure, isolated environment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Who typically uses Eventis?</AccordionTrigger>
                        <AccordionContent>
                            Eventis is designed for personal injury and medical malpractice firms. Paralegals use it to cut down summarization time from days to minutes, allowing them to focus on case strategy.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What is the turnaround time?</AccordionTrigger>
                        <AccordionContent>
                            Most cases are processed in under 30 minutes, depending on the file size. You receive an email notification as soon as your reports are ready.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
