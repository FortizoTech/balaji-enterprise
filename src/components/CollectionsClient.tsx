'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

import ConsultPopover from './ConsultPopover';

function ImageCarousel({ images, alt }: { images: string[], alt: string }) {
    const [index, setIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full aspect-[4/3] group/carousel overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.img
                    key={index}
                    src={images[index]}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                />
            </AnimatePresence>

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all backdrop-blur-sm z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all backdrop-blur-sm z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-gold' : 'w-1.5 bg-white/50'}`} />
                        ))}
                    </div>
                </>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>
    );
}

interface Product {
    id: string;
    name: string;
    collection: string;
    category: string;
    description: string;
    images: string[];
    price: number;
    unit: string;
    dimensions: string;
}

function CollectionsClientContent({ initialProducts, categories }: { initialProducts: Product[], categories: any[] }) {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || 'all';
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    useEffect(() => {
        if (initialQuery) {
            setSearchQuery(initialQuery);
        }
        const cat = searchParams.get('category');
        if (cat) {
            setActiveCategory(cat);
        }
    }, [initialQuery, searchParams]);

    const filtered = initialProducts.filter((p) => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.dimensions.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding mb-16">
                <div className="max-w-xl">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">Collections</p>
                        <h1 className="font-heading text-display text-foreground mb-12">
                            Surfaces of Distinction
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1}>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="Search collection (e.g. Spanish, 60x60...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-muted/50 border border-transparent focus:border-gold/50 focus:bg-background px-12 py-4 font-body text-sm text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="content-padding mb-8 md:mb-16 relative">
                <div className="flex overflow-x-auto md:flex-wrap gap-2 md:gap-3 pb-4 md:pb-0 snap-x no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 relative z-10">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 font-body text-[12px] md:text-xs tracking-widest uppercase px-4 py-2 md:px-6 md:py-3 transition-colors rounded-full md:rounded-none snap-start ${activeCategory === cat.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent md:hidden pointer-events-none z-20" />
            </section>

            <section className="content-padding pb-24 md:pb-32">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-12 md:gap-y-32">
                    {filtered.map((product, i) => (
                        <ScrollReveal key={product.id}>
                            <div className="group relative">
                                {/* Absolute Link Overlay */}
                                <Link
                                    href={`/product/${product.id}`}
                                    className="absolute inset-0 z-10"
                                    aria-label={`View ${product.name}`}
                                />

                                <div className={`flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-16 md:items-center ${i % 2 === 1 ? 'md:order-last' : ''}`}>
                                    <div className="md:col-span-1 relative z-20">
                                        <ImageCarousel images={product.images} alt={product.name} />
                                    </div>
                                    <div className={`md:col-span-1 flex flex-col items-start ${i % 2 === 1 ? 'md:text-right md:items-end md:order-first' : ''}`}>
                                        <p className="font-body text-[10px] md:text-xs tracking-widest uppercase text-gold mb-1 md:mb-4">{product.collection}</p>
                                        <h2 className="font-heading text-sm md:text-headline text-foreground group-hover:text-gold transition-colors mb-2 md:mb-6 leading-tight">
                                            {product.name}
                                        </h2>
                                        <p className="hidden md:block font-body text-body-lg text-muted-foreground leading-relaxed mb-8 max-w-md ml-auto mr-0">
                                            {product.description}
                                        </p>
                                        <div className={`flex flex-col md:flex-row md:items-baseline md:gap-2 mb-0 md:mb-8 ${i % 2 === 1 ? 'md:justify-end' : ''}`}>
                                            <span className="font-heading text-sm md:text-3xl text-foreground">D{product.price}</span>
                                            <span className="hidden md:inline font-body text-sm text-muted-foreground">{product.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-6 relative z-20">
                                            <span className="hidden md:inline-block font-body text-xs tracking-widest uppercase text-foreground border-b border-foreground pb-1 group-hover:border-gold group-hover:text-gold transition-colors">
                                                Discover
                                            </span>
                                            <ConsultPopover
                                                product={product}
                                                trigger={
                                                    <button
                                                        className="hidden md:inline-block font-body text-xs tracking-widest uppercase text-gold hover:text-foreground transition-colors"
                                                    >
                                                        Inquiry
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function CollectionsClient(props: { initialProducts: Product[], categories: any[] }) {
    return (
        <Suspense fallback={
            <div className="pt-32 content-padding min-h-screen flex items-center justify-center">
                <div className="text-muted-foreground font-body text-sm tracking-widest uppercase animate-pulse">
                    Sourcing Surfaces...
                </div>
            </div>
        }>
            <CollectionsClientContent {...props} />
        </Suspense>
    );
}
