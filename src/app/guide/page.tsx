import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
const tileMarble = '/assets/tile-marble-white.jpg';
const tileConcrete = '/assets/tile-concrete.jpg';
const tileNavy = '/assets/tile-navy.jpg';
const tileTerracotta = '/assets/tile-terracotta.jpg';
const tileSlate = '/assets/tile-black-slate.jpg';

const materials = [
    {
        name: 'Marble',
        image: tileMarble,
        description: 'Timeless elegance with natural veining. Each piece is unique, offering unparalleled luxury.',
        durability: 'Medium',
        bestFor: 'Living rooms, bathrooms, feature walls',
        finishes: ['Polished', 'Honed', 'Brushed'],
    },
    {
        name: 'Porcelain',
        image: tileNavy,
        description: 'Engineered for strength and versatility. Resistant to stains, scratches, and moisture.',
        durability: 'High',
        bestFor: 'Kitchens, high-traffic areas, outdoor spaces',
        finishes: ['Matte', 'Gloss', 'Textured'],
    },
    {
        name: 'Concrete Effect',
        image: tileConcrete,
        description: 'Industrial sophistication with a modern edge. Delivers contemporary minimalism.',
        durability: 'High',
        bestFor: 'Lofts, commercial spaces, modern interiors',
        finishes: ['Matte', 'Semi-polished'],
    },
    {
        name: 'Terracotta',
        image: tileTerracotta,
        description: 'Warm, earthy tones that bring organic character to any space.',
        durability: 'Medium',
        bestFor: 'Mediterranean designs, outdoor patios, rustic interiors',
        finishes: ['Natural', 'Glazed'],
    },
    {
        name: 'Slate',
        image: tileSlate,
        description: 'Bold and dramatic. Natural texture with deep, rich coloring.',
        durability: 'High',
        bestFor: 'Feature walls, wet rooms, entryways',
        finishes: ['Cleft', 'Honed', 'Brushed'],
    },
];

export default function Guide() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Material Guide</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Understanding<br />Our Materials</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            Every surface tells a story. Learn about the characteristics, durability, and ideal applications
                            of each material in our collection.
                        </p>
                    </ScrollReveal>

                    <div className="space-y-24">
                        {materials.map((material, i) => (
                            <ScrollReveal key={material.name} delay={0.1}>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${i % 2 === 1 ? 'md:[direction:rtl] md:[&>*]:[direction:ltr]' : ''}`}>
                                    <div className="overflow-hidden">
                                        <img src={material.image} alt={material.name} className="w-full aspect-[4/5] object-cover" loading="lazy" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">{material.name}</h2>
                                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-8">{material.description}</p>

                                        <div className="space-y-4 border-t border-border pt-6">
                                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                                <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">Durability</span>
                                                <span className="font-body text-sm text-foreground font-medium">{material.durability}</span>
                                            </div>
                                            <div className="flex justify-between items-start py-2 border-b border-border/50">
                                                <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">Best For</span>
                                                <span className="font-body text-sm text-foreground font-medium text-right max-w-[60%]">{material.bestFor}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">Finishes</span>
                                                <div className="flex gap-2">
                                                    {material.finishes.map((f) => (
                                                        <span key={f} className="font-body text-[10px] tracking-wider uppercase border border-border px-2 py-1 text-muted-foreground">{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Need Help Choosing?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Order free samples and feel the difference in your hands.</p>
                        <Link
                            href="/samples"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Order Samples
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
