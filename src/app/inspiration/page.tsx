'use client';
import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
const interiorLiving = '/assets/interior-living.jpg';
const interiorKitchen = '/assets/interior-kitchen.jpg';
const interiorBathroom = '/assets/interior-bathroom.jpg';
const heroTiles = '/assets/hero-tiles.jpg';

const projects = [
    {
        title: 'The Meridian Residence',
        location: 'London, UK',
        description: 'A contemporary penthouse featuring our Calacatta marble throughout the open-plan living space.',
        image: interiorLiving,
        tags: ['Marble', 'Residential'],
        material: 'marble'
    },
    {
        title: 'Atelier Noir Restaurant',
        location: 'Paris, France',
        description: 'Dark porcelain tiles creating an intimate, moody atmosphere for fine dining.',
        image: interiorKitchen,
        tags: ['Porcelain', 'Commercial'],
        material: 'porcelain'
    },
    {
        title: 'The Waterfront Spa',
        location: 'Dubai, UAE',
        description: 'Natural stone mosaics bringing organic warmth to a luxury wellness retreat.',
        image: interiorBathroom,
        tags: ['Natural Stone', 'Hospitality'],
        material: 'stone'
    },
    {
        title: 'Modernist Villa',
        location: 'Barcelona, Spain',
        description: 'Clean concrete-effect tiles blending indoor and outdoor living spaces seamlessly.',
        image: heroTiles,
        tags: ['Concrete', 'Residential'],
        material: 'porcelain'
    },
];

export default function Inspiration() {
    const [filter, setFilter] = useState('all');

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.material === filter);

    return (
        <div className="pt-24 md:pt-32 bg-[#fafafa]">
            <section className="content-padding pt-20 pb-10">
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl">
                            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-6">Archive of Light</p>
                            <h1 className="font-heading text-display md:text-[6rem] leading-[0.9] text-foreground mb-8 tracking-tighter">Inspiration</h1>
                            <p className="font-body text-body-lg text-muted-foreground leading-relaxed">
                                A curated selection of architectural milestones defining the Balaji Enterprise aesthetic across the globe.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 border-b border-black/5 pb-4">
                            {['all', 'marble', 'porcelain', 'stone'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`font-body text-[10px] tracking-widest uppercase pb-1 transition-all ${filter === f ? 'text-gold border-b border-gold' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <section className="content-padding pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-24">
                    {filteredProjects.map((project, i) => (
                        <ScrollReveal key={project.title} delay={i * 0.1} direction="up">
                            <div className={`group cursor-pointer ${i % 2 === 1 ? 'md:mt-32' : ''}`}>
                                <div className="relative overflow-hidden mb-10 shadow-2xl">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full aspect-[4/5] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="w-10 h-[1px] bg-gold/50" />
                                    <div className="flex gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="font-body text-[9px] tracking-[0.2em] uppercase text-gold font-bold">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="font-heading text-4xl text-foreground mb-4 group-hover:text-gold transition-colors duration-500 tracking-tight">{project.title}</h3>
                                <p className="font-body text-xs tracking-widest uppercase text-muted-foreground/60 mb-6 font-medium">{project.location}</p>
                                <p className="font-body text-base text-muted-foreground leading-relaxed max-w-md opacity-80">{project.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="bg-primary section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Have a Project in Mind?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Our design team is ready to help you bring your vision to life.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
