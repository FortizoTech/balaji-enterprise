import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
const tileMarble = '/assets/tile-marble-white.jpg';
const tileConcrete = '/assets/tile-concrete.jpg';
const tileNavy = '/assets/tile-navy.jpg';
const tileTerracotta = '/assets/tile-terracotta.jpg';
const tileSlate = '/assets/tile-black-slate.jpg';
import { Package, Truck, RotateCcw } from 'lucide-react';

const sampleTiles = [
    { name: 'Calacatta White Marble', image: tileMarble, size: '10×10 cm' },
    { name: 'Urban Concrete Grey', image: tileConcrete, size: '10×10 cm' },
    { name: 'Midnight Navy Porcelain', image: tileNavy, size: '10×10 cm' },
    { name: 'Tuscan Terracotta', image: tileTerracotta, size: '10×10 cm' },
    { name: 'Black Slate Natural', image: tileSlate, size: '10×10 cm' },
];

const steps = [
    { icon: Package, title: 'Select Samples', description: 'Choose up to 5 samples from our collection.' },
    { icon: Truck, title: 'Free Delivery', description: 'Samples are delivered to your door within 3–5 business days.' },
    { icon: RotateCcw, title: 'Decide & Return', description: 'Keep what you love. Return the rest with our pre-paid label.' },
];

export default function Samples() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Sample Ordering</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Feel the<br />Difference</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            Nothing compares to experiencing our materials in person. Order up to 5 free samples
                            and discover the quality that sets Balaji Enterprise apart.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                            {steps.map((step, i) => (
                                <div key={step.title} className="text-center">
                                    <div className="w-16 h-16 mx-auto flex items-center justify-center border border-gold/30 mb-6">
                                        <step.icon className="w-6 h-6 text-gold" />
                                    </div>
                                    <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step {i + 1}</p>
                                    <h3 className="font-heading text-xl text-foreground mb-2">{step.title}</h3>
                                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    <ScrollReveal>
                        <h2 className="font-heading text-headline text-foreground mb-12">Available Samples</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {sampleTiles.map((tile, i) => (
                            <ScrollReveal key={tile.name} delay={i * 0.05}>
                                <div className="group cursor-pointer">
                                    <div className="overflow-hidden mb-4">
                                        <img
                                            src={tile.image}
                                            alt={tile.name}
                                            className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <h3 className="font-body text-sm text-foreground font-medium mb-1">{tile.name}</h3>
                                    <p className="font-body text-xs text-muted-foreground">{tile.size}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-primary section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Ready to Order Samples?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Contact our team to request your free sample box.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Request Samples
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
