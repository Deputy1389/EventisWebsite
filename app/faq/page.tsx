"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

const firmFaqs = [
  {
    question: "How long does processing take?",
    answer: "Most litigation packets process in 5-30 minutes depending on page count and complexity. You'll receive notification when the chronology is ready for audit review."
  },
  {
    question: "Do you handle scanned and messy records?",
    answer: "Yes. Our OCR pipeline is specifically architected for scanned, faxed, and low-quality medical record packets, preserving spatial context for medical events."
  },
  {
    question: "How do the page-level citations work?",
    answer: "Every clinical event is anchored to a specific page and coordinate in the source PDF. Clicking a citation opens the exact page for verification."
  },
  {
    question: "Does LineCite replace human review?",
    answer: "No. LineCite automates the extraction and organization of evidence to accelerate review. Our Audit Mode is designed for paralegals and attorneys to verify and annotate the chronology before final export."
  },
  {
    question: "What file formats are supported?",
    answer: "We support standard PDF formats, including those with multiple document types merged into a single packet."
  }
];

const apiFaqs = [
  {
    question: "What are the rate limits for the API?",
    answer: "API rate limits are tier-based. Enterprise tiers offer dedicated throughput and custom limits based on processing volume."
  },
  {
    question: "Does the API support webhooks?",
    answer: "Yes. You can register webhooks for job.completed and job.failed events to handle asynchronous extraction results."
  },
  {
    question: "What is the difference between extraction and verification?",
    answer: "Extraction converts PDFs into structured medical events. Verification checks specific claims against the evidence graph to determine if they are supported or contradicted by the source records."
  },
  {
    question: "How is usage priced?",
    answer: "API usage is priced per job or per page processed. Volume discounts are automatically applied for high-scale platform integrations."
  },
  {
    question: "Is there a sandbox environment?",
    answer: "Yes. We provide a developer sandbox for integration testing and schema validation."
  }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<'firm' | 'api'>('firm');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = activeTab === 'firm' ? firmFaqs : apiFaqs;

  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-widest text-center">Frequently Asked Questions</h1>
        <p className="text-lg text-slate-400 mb-16 text-center max-w-2xl mx-auto font-medium leading-relaxed">
          Common questions for law firms and platforms integrating with the LineCite evidence engine.
        </p>

        <div className="flex justify-center mb-12">
          <div className="bg-surface-dark p-1 rounded-2xl border border-border-dark flex">
            <button 
              onClick={() => { setActiveTab('firm'); setOpenIndex(null); }}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'firm' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
            >
              Law Firms
            </button>
            <button 
              onClick={() => { setActiveTab('api'); setOpenIndex(null); }}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'api' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
            >
              API / Developers
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border-dark rounded-2xl bg-background-dark/50 overflow-hidden hover:border-primary/20 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left group"
              >
                <span className="font-black text-white uppercase tracking-widest">{faq.question}</span>
                <span className={`text-slate-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                  <Icon name="expand_more" className="w-6 h-6" />
                </span>
              </button>
              {openIndex === index && (
                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-slate-400 leading-relaxed font-medium">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-3xl bg-primary/5 border border-primary/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
          <h4 className="text-xl font-black text-white mb-4 uppercase tracking-widest">Still have questions?</h4>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Contact our team for specific inquiries regarding firm access or API documentation.
          </p>
          <a href="mailto:support@linecite.com" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary hover:gap-6 transition-all">
            Email Support <Icon name="chevron_right" className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
