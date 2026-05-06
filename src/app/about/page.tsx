import ScrollReveal from '@/components/ScrollReveal';
const interiorLiving = '/assets/interior-living.jpg';
const heroTiles = '/assets/hero-tiles.jpg';
import Link from 'next/link';

export default function About() {
  return (
    <div className="pt-24 md:pt-32">
      <section className="content-padding section-padding">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <ScrollReveal>
            <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Our Story</p>
            <h1 className="font-heading text-display text-foreground mb-8">Built on Craft & Conviction</h1>
            <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-6">
              Balaji Enterprise was founded with a singular purpose: to elevate the surfaces people live with every day. 
              We believe that the materials surrounding you shape how you feel, think, and create.
            </p>
            <p className="font-body text-body-lg text-muted-foreground leading-relaxed">
              From sourcing raw materials to engineering the final product, every step is guided by an 
              obsession with quality and an unwavering respect for natural beauty.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <img src={heroTiles} alt="Balaji Enterprise showroom" className="w-full aspect-[4/5] object-cover" loading="lazy" />
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-muted section-padding content-padding">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-heading text-headline text-foreground mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Material Integrity', desc: 'We source only the finest natural and engineered materials from trusted quarries and factories worldwide.' },
                { title: 'Design Excellence', desc: 'Every collection is curated to blend timeless aesthetics with contemporary architectural vision.' },
                { title: 'Lasting Quality', desc: 'Our tiles are built to endure—resisting wear, weather, and time with grace.' },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-heading text-xl text-foreground mb-4">{item.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="overflow-hidden">
          <img src={interiorLiving} alt="Luxury interior" className="w-full h-[60vh] object-cover" loading="lazy" />
        </div>
      </section>

      <section className="bg-primary section-padding content-padding">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-headline text-primary-foreground mb-8">Ready to Transform Your Space?</h2>
            <Link
              href="/collections"
              className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5"
            >
              Explore Collections
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
