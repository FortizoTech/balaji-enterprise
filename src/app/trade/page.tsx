import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
const heroTiles = '/assets/hero-tiles.jpg';
import { Ruler, Percent, Headset, Clock } from 'lucide-react';

const benefits = [
    { icon: Percent, title: 'Trade Pricing', description: 'Access exclusive wholesale pricing on our entire collection, with volume-based tiers.' },
    { icon: Ruler, title: 'Custom Specifications', description: 'Work with our team to source bespoke sizes, finishes, and materials for your projects.' },
    { icon: Headset, title: 'Dedicated Support', description: 'A personal account manager to assist with specifications, logistics, and project timelines.' },
    { icon: Clock, title: 'Priority Fulfillment', description: 'Fast-track processing and delivery for trade orders, keeping your projects on schedule.' },
];

export default function Trade() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Trade Program</p>
                        <h1 className="font-heading text-display text-foreground mb-8">Built for<br />Professionals</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-6">
                            Our Trade Program is designed exclusively for architects, interior designers, and
                            contractors who demand the finest materials for their projects.
                        </p>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-10">
                            Join a network of industry professionals who trust Balaji Enterprise to deliver
                            uncompromising quality and service.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Apply Now
                        </Link>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <img src={heroTiles} alt="Trade showroom" className="w-full aspect-[4/5] object-cover" loading="lazy" />
                    </ScrollReveal>
                </div>
            </section>

            <section className="bg-muted section-padding content-padding">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <h2 className="font-heading text-headline text-foreground text-center mb-16">Program Benefits</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {benefits.map((benefit, i) => (
                            <ScrollReveal key={benefit.title} delay={i * 0.1}>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 flex items-center justify-center border border-gold/30 flex-shrink-0">
                                        <benefit.icon className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-xl text-foreground mb-2">{benefit.title}</h3>
                                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-primary section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Ready to Partner With Us?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Submit your application and our team will be in touch within 24 hours.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
