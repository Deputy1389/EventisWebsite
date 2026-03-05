export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p className="text-slate-400">
              LineCite Inc. ("we," "our," or "us") operates the LineCite platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="text-slate-400 mb-3">We collect:</p>
            <ul className="list-disc pl-6 text-slate-400 space-y-2">
              <li><strong>Account information:</strong> Name, email, law firm name</li>
              <li><strong>Case data:</strong> Medical records, PDFs, and documents you upload for processing</li>
              <li><strong>Usage data:</strong> How you interact with our platform</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-400 mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 text-slate-400 space-y-2">
              <li>Process and analyze medical records you upload</li>
              <li>Generate medical chronologies with source citations</li>
              <li>Provide customer support</li>
              <li>Improve and maintain our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
            <p className="text-slate-400">
              We implement appropriate technical and organizational measures to protect your data, including AES-256 encryption at rest, TLS 1.3 in transit, and role-based access controls. Your case data is logically isolated per tenant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p className="text-slate-400">
              You control your data. Delete any case at any time, and it is permanently erased from our systems. If you close your account, we retain minimal data for legal compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. No Model Training</h2>
            <p className="text-slate-400">
              <strong>We do not use your documents to train AI models.</strong> Your case data is used solely to provide the services you request. We do not share your data with third parties for their marketing or advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="text-slate-400 mb-3">Under applicable law, you may have rights to:</p>
            <ul className="list-disc pl-6 text-slate-400 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Object to certain processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
            <p className="text-slate-400">
              For privacy-related inquiries, contact us at{" "}
              <a href="mailto:patrick@linecite.com" className="text-primary hover:underline">
                patrick@linecite.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
