export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-400">
              By accessing or using the LineCite platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-slate-400">
              LineCite provides deterministic medical chronology extraction for personal injury litigation. The Service processes uploaded medical documents and generates citation-anchored timelines for legal review. We reserve the right to modify or discontinue the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="text-slate-400 mb-3">When you create an account:</p>
            <ul className="list-disc pl-6 text-slate-400 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="text-slate-400 mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-400 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload content you do not have the right to process</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Upload malicious code or viruses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
            <p className="text-slate-400">
              The Service, including all content, features, and functionality, is owned by LineCite Inc. and is protected by copyright, trademark, and other intellectual property laws. You retain ownership of documents you upload; we obtain a limited license to process them for your benefit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Payment Terms</h2>
            <p className="text-slate-400">
              The Service is billed monthly. All fees are non-refundable unless otherwise required by law. You authorize us to charge your payment method for any fees incurred. Prices are subject to change with 30 days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-slate-400">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-slate-400">
              IN NO EVENT SHALL LINECITE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Indemnification</h2>
            <p className="text-slate-400">
              You agree to indemnify, defend, and hold harmless LineCite and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
            <p className="text-slate-400">
              We may terminate or suspend your account immediately for any reason, including breach of these Terms. Upon termination, your right to use the Service stops immediately. You may delete your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Governing Law</h2>
            <p className="text-slate-400">
              These Terms shall be governed by the laws of the State of Delaware, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
            <p className="text-slate-400">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@linecite.com" className="text-primary hover:underline">
                legal@linecite.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
