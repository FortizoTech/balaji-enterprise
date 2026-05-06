import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function Policies() {
    return (
        <div className="pt-24 md:pt-32 content-padding bg-background min-h-screen">
            <div className="max-w-4xl mx-auto py-12">
                <Link href="/" className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12">
                    <ArrowLeft className="w-4 h-4" /> Return to Atelier
                </Link>

                <ScrollReveal>
                    <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-6 italic">Balaji Enterprise Digital Atelier</p>
                    <h1 className="font-heading text-display-sm text-foreground mb-16">Privacy & Refund Policies</h1>
                </ScrollReveal>

                <div className="space-y-16">
                    {/* Refund Policy */}
                    <ScrollReveal>
                        <section>
                            <h2 className="font-heading text-2xl text-foreground mb-6 flex items-center gap-4">
                                <span className="w-6 h-[1px] bg-gold block"></span>
                                Refund Policy
                            </h2>
                            <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-4">
                                <p>
                                    At Balaji Enterprise, we stand behind the monumental quality of our surfaces. However, we understand that anomalies occur.
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Duration:</strong> Refund requests must be initiated within <strong>14 days</strong> of receiving your delivery.</li>
                                    <li><strong>Condition:</strong> Surfaces must remain completely uninstalled, undamaged, and secured in their original Atelier shipping crates.</li>
                                    <li><strong>Processing:</strong> Approved refunds will be sequentially credited to your original Modem Pay account or bank within 5-10 business days.</li>
                                </ul>
                                <p className="pt-4 text-xs opacity-70">
                                    To initiate a refund request, navigate to your Account Dashboard and select the appropriate order reference, or contact our concierge directly.
                                </p>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* Privacy Policy */}
                    <ScrollReveal>
                        <section>
                            <h2 className="font-heading text-2xl text-foreground mb-6 flex items-center gap-4">
                                <span className="w-6 h-[1px] bg-gold block"></span>
                                Privacy Policy
                            </h2>
                            <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-4">
                                <p>
                                    Your privacy is respected as fundamentally as the exclusivity of our collections. Balaji Enterprise Digital Atelier strictly protects your data.
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Collection:</strong> We only collect critical logistical data required to securely transport your goods (name, address, secure payment relays).</li>
                                    <li><strong>Third Parties:</strong> Your data is absolutely never sold. It is exclusively processed through our encryption gateways and logistics partners (such as Modem Pay).</li>
                                    <li><strong>Right to Erasure:</strong> You hold supreme authority over your data. You may request total erasure of your profile metrics at any time.</li>
                                </ul>
                            </div>
                        </section>
                    </ScrollReveal>

                    {/* Terms */}
                    <ScrollReveal>
                        <section>
                            <h2 className="font-heading text-2xl text-foreground mb-6 flex items-center gap-4">
                                <span className="w-6 h-[1px] bg-gold block"></span>
                                Terms & Conditions
                            </h2>
                            <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-4">
                                <p>
                                    By processing payments and completing acquisitions through our marketplace, you agree unconditionally to the terms specified above. Product variations naturally occur within stone and marble; these organic variations do not legally constitute damage or defect. Prices are subject to adjustment without prior public notice.
                                </p>
                            </div>
                        </section>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
