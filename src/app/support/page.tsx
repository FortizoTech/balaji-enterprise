import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import { MessageSquare, FileText, Users, Lightbulb } from 'lucide-react';

const services = [
    {
        icon: Lightbulb,
        title: 'Design Consultation',
        description: 'Work with our in-house design team to select the perfect materials, patterns, and layouts for your project.',
    },
    {
        icon: FileText,
        title: 'Technical Specifications',
        description: 'Access detailed spec sheets, CAD files, and BIM objects for seamless integration into your project documentation.',
    },
    {
        icon: Users,
        title: 'On-Site Assistance',
        description: 'For large-scale projects, our specialists can visit your site to provide hands-on guidance and recommendations.',
    },
    {
        icon: MessageSquare,
        title: 'Project Estimates',
        description: 'Submit your floor plans and receive a comprehensive material estimate with pricing within 48 hours.',
    },
];

export default function Support() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Project Support</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Expert Guidance<br />at Every Stage</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            From concept to completion, our project support team ensures your vision is realized
                            with precision and excellence.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {services.map((service, i) => (
                            <ScrollReveal key={service.title} delay={i * 0.1}>
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 flex items-center justify-center border border-gold/30 flex-shrink-0">
                                        <service.icon className="w-6 h-6 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl text-foreground mb-3">{service.title}</h3>
                                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-muted section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-foreground mb-6">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                            {[
                                { step: '01', title: 'Share Your Vision', desc: 'Tell us about your project, timeline, and material preferences.' },
                                { step: '02', title: 'Receive a Proposal', desc: 'Our team prepares a tailored specification and estimate.' },
                                { step: '03', title: 'Execute With Confidence', desc: 'We coordinate delivery and provide ongoing support through completion.' },
                            ].map((item) => (
                                <div key={item.step}>
                                    <p className="font-heading text-5xl text-gold/30 mb-4">{item.step}</p>
                                    <h3 className="font-heading text-xl text-foreground mb-2">{item.title}</h3>
                                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <section className="bg-primary section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Start Your Project</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Reach out and let's discuss how we can support your next build.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
