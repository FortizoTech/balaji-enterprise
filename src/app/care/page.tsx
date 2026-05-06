import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import { Droplets, ShieldCheck, Hammer, Sparkles } from 'lucide-react';

const careGuides = [
    {
        icon: Droplets,
        title: 'Daily Cleaning',
        description: 'For routine maintenance, simply use a damp mop or cloth with warm water. Avoid harsh chemicals that can damage sealants and surface finishes.',
        tips: [
            'Use pH-neutral tile cleaners only',
            'Wipe up spills promptly to prevent staining',
            'Sweep or vacuum loose debris before mopping',
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Sealing & Protection',
        description: 'Natural stone tiles require periodic sealing to maintain their beauty and resistance. We recommend sealing every 12–18 months.',
        tips: [
            'Apply impregnating sealant to natural stone',
            'Test sealant on a small area first',
            'Ensure surface is completely dry before application',
        ],
    },
    {
        icon: Sparkles,
        title: 'Stain Removal',
        description: 'Different materials require different approaches. Always test cleaning solutions on an inconspicuous area first.',
        tips: [
            'Use baking soda paste for organic stains on marble',
            'Hydrogen peroxide for mould on grout lines',
            'Acetone for adhesive or paint residue on porcelain',
        ],
    },
    {
        icon: Hammer,
        title: 'Repair & Restoration',
        description: 'Minor chips and scratches can often be addressed without full replacement. For significant damage, consult a professional installer.',
        tips: [
            'Use colour-matched epoxy for small chips',
            'Re-grout joints showing signs of wear',
            'Contact us for replacement tiles from the same batch',
        ],
    },
];

const installationSteps = [
    { step: '01', title: 'Surface Preparation', description: 'Ensure the substrate is clean, flat, dry, and structurally sound. Use self-levelling compound for uneven floors.' },
    { step: '02', title: 'Layout Planning', description: 'Dry-lay your tiles to plan the pattern and minimise narrow cuts at edges. Start from the centre of the room.' },
    { step: '03', title: 'Adhesive Application', description: 'Use the correct adhesive for your tile type and substrate. Apply with a notched trowel for consistent coverage.' },
    { step: '04', title: 'Grouting & Finishing', description: 'Allow adhesive to cure fully (24–48hrs) before grouting. Use flexible grout for floor applications and areas prone to movement.' },
];

export default function Care() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Care & Installation</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Maintain the<br />Beauty</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            Proper care and installation ensure your tiles look stunning for decades.
                            Follow our expert guidelines to protect your investment.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {careGuides.map((guide, i) => (
                            <ScrollReveal key={guide.title} delay={i * 0.1}>
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 flex items-center justify-center border border-gold/30">
                                            <guide.icon className="w-5 h-5 text-gold" />
                                        </div>
                                        <h3 className="font-heading text-2xl text-foreground">{guide.title}</h3>
                                    </div>
                                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{guide.description}</p>
                                    <ul className="space-y-2">
                                        {guide.tips.map((tip) => (
                                            <li key={tip} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-gold mt-1">•</span> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-muted section-padding content-padding">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <h2 className="font-heading text-headline text-foreground text-center mb-16">Installation Guide</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {installationSteps.map((item, i) => (
                            <ScrollReveal key={item.step} delay={i * 0.1}>
                                <div className="flex gap-6">
                                    <p className="font-heading text-4xl text-gold/30 flex-shrink-0">{item.step}</p>
                                    <div>
                                        <h3 className="font-heading text-xl text-foreground mb-2">{item.title}</h3>
                                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.description}</p>
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
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Need Professional Help?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Our experts can recommend certified installers in your area.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Get Support
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
