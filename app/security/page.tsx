import { Shield, Lock, Server, FileKey } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-6">Security First</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        We handle sensitive medical and legal data. Security is not an afterthought; it is our foundation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
                    <div className="p-8 border rounded-xl bg-card">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary mr-4">
                                <Lock className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Encryption Everywhere</h3>
                        </div>
                        <p className="text-muted-foreground">
                            Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your files are stored in secure, isolated containers.
                        </p>
                    </div>

                    <div className="p-8 border rounded-xl bg-card">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary mr-4">
                                <Server className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Data Isolation</h3>
                        </div>
                        <p className="text-muted-foreground">
                            We maintain strict logical separation between tenants. Your case data is never accessible to other users.
                        </p>
                    </div>

                    <div className="p-8 border rounded-xl bg-card">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary mr-4">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">No Model Training</h3>
                        </div>
                        <p className="text-muted-foreground">
                            <strong>We do not train our AI models on your customer data.</strong> Your data remains yours and is used solely to generate your reports.
                        </p>
                    </div>

                    <div className="p-8 border rounded-xl bg-card">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary mr-4">
                                <FileKey className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Retention Policy</h3>
                        </div>
                        <p className="text-muted-foreground">
                            You control your data retention. Delete cases at any time, and they are permanently erased from our servers immediately.
                        </p>
                    </div>
                </div>

                {/* Roadmap */}
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-8">Compliance Roadmap</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground">SOC2 Type II (Planned)</span>
                        <span className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground">HIPAA BAA (Available)</span>
                        <span className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground">GDPR/CCPA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
