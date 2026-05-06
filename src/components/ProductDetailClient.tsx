'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ImageLightbox';
import ConsultPopover from './ConsultPopover';

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
    const galleryImages = (product.productImages && product.productImages.length > 0)
        ? product.productImages.map((img: any) => img.url)
        : (product.images && product.images.length > 0 ? product.images : ['/placeholder-tile.jpg']);

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // --- Variant Grouping Logic ---
    const variants = product.variants || [];
    const hasVariants = variants.length > 0;

    // Group variants by Dimension
    const groupedVariants = variants.reduce((acc: any, v: any) => {
        const dim = (v.options as any)?.Dimension || v.title.split(' / ')[0] || 'Standard';
        if (!acc[dim]) acc[dim] = [];
        acc[dim].push(v);
        return acc;
    }, {});

    const dimensions = Object.keys(groupedVariants);
    const [selectedDim, setSelectedDim] = useState(dimensions[0] || null);

    // Helper to get selected variant from current Dim/Tex
    const currentDimVariants = selectedDim ? groupedVariants[selectedDim] : [];
    const hasTextures = currentDimVariants.some((v: any) => (v.options as any)?.Texture || v.title.includes(' / '));

    const [selectedTex, setSelectedTex] = useState<string | null>(null);
    const [isTextureRevealed, setIsTextureRevealed] = useState(false);

    // Find the actual variant object based on Dim and Tex
    const selectedVariant = selectedTex ? (currentDimVariants.find((v: any) => {
        const tex = (v.options as any)?.Texture || (v.title.includes(' / ') ? v.title.split(' / ')[1] : null);
        return tex === selectedTex;
    }) || null) : null;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    const addItem = useCartStore((s) => s.addItem);
    const { toast } = useToast();

    // Mobile Accordion State
    const [mobileDescOpen, setMobileDescOpen] = useState(false);
    const [mobileSpecsOpen, setMobileSpecsOpen] = useState(false);
    const [mobileInstallOpen, setMobileInstallOpen] = useState(false);

    const handleAddToCart = () => {
        addItem(product, quantity, selectedVariant);
        toast({
            title: 'Added to Quote Request',
            description: `${quantity} × ${product.name} ${selectedVariant ? `(${selectedVariant.title})` : ''} added to your request.`,
        });
    };

    return (
        <div className="pt-24 md:pt-32">
            <div className="content-padding mb-8">
                <Link href="/collections" className="font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
                    ← Collections
                </Link>
            </div>

            <div className="content-padding pb-32">
                {/* 75/25 Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">

                    {/* LEFT COLUMN (75%) - Media & Extended Details */}
                    <div className="space-y-16">
                        {/* Gallery Section: Vertical Thumbnails + Main Image */}
                        <div className={cn(
                            "grid grid-cols-1 gap-6",
                            galleryImages.length > 1 && "lg:grid-cols-[100px_1fr]"
                        )}>

                            {/* Vertical Thumbnails (Desktop Only) */}
                            {galleryImages.length > 1 && (
                                <div className="hidden lg:flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar py-1">
                                    {galleryImages.map((img: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={cn(
                                                "w-full aspect-square overflow-hidden border transition-all duration-300",
                                                activeImage === i ? "border-gold ring-1 ring-gold" : "border-border opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Large Image */}
                            <div className="relative">
                                {/* Desktop Large View */}
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="hidden lg:block overflow-hidden cursor-zoom-in relative group border border-border"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-white">
                                            <Maximize2 className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <img
                                        src={galleryImages[activeImage]}
                                        alt={product.name}
                                        className="w-full max-h-[70vh] object-contain transition-transform duration-700 group-hover:scale-105 bg-gray-50"
                                    />
                                </motion.div>

                                {/* Mobile Swipe View */}
                                <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar mb-4 -mx-4 px-4 gap-4 pb-2">
                                    {galleryImages.map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            className="snap-center shrink-0 w-[85vw] aspect-square overflow-hidden relative border border-border"
                                            onClick={() => setIsLightboxOpen(true)}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white">
                                                {i + 1} / {galleryImages.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Extended Product Details (Desktop: Below Gallery) */}
                        <div className="hidden lg:block space-y-16 pt-12 border-t border-border/50">
                            {/* Technical Specifications */}
                            <section>
                                <h3 className="font-heading text-2xl text-foreground mb-8">Technical Details</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                    {Object.entries(product.techSpecs || {}).map(([label, value]) => (
                                        <div key={label} className="border-l border-gold/30 pl-4 py-2">
                                            <span className="block font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">{label.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="block font-body text-sm text-foreground font-medium">{value as string}</span>
                                        </div>
                                    ))}
                                    <div className="border-l border-gold/30 pl-4 py-2">
                                        <span className="block font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Main Dimension</span>
                                        <span className="block font-body text-sm text-foreground font-medium">{product.dimensions}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Installation Guide */}
                            <section className="bg-gray-50/50 p-12">
                                <h3 className="font-heading text-2xl text-foreground mb-8">Care & Installation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <ul className="space-y-6">
                                        {(product.installation || []).map((step: string, idx: number) => (
                                            <li key={idx} className="font-body text-sm text-muted-foreground flex items-start gap-6">
                                                <span className="text-gold font-heading text-lg">0{idx + 1}</span>
                                                <span className="leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="relative aspect-video bg-gray-200 overflow-hidden flex items-center justify-center p-8 text-center text-muted-foreground border border-border italic font-body text-sm">
                                        Visual references for installation curated by Balaji Enterprise.
                                    </div>
                                </div>
                            </section>

                            {/* Long Description Area */}
                            <section className="max-w-3xl">
                                <h3 className="font-heading text-2xl text-foreground mb-6">Designer&apos;s Notes</h3>
                                {product.description?.includes('<') ? (
                                    <div
                                        className="font-body text-body-lg text-muted-foreground leading-relaxed prose prose-stone max-w-none prose-p:leading-relaxed prose-p:mb-4"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="font-body text-body-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                )}
                            </section>

                            {/* Project In-Use Gallery */}
                            {galleryImages.length > 1 && (
                                <section>
                                    <h3 className="font-heading text-2xl text-foreground mb-8">Inspiration Gallery</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {galleryImages.map((img: string, i: number) => (
                                            <div key={i} className={cn(
                                                "overflow-hidden border border-border aspect-[4/3] group cursor-zoom-in",
                                                i === 0 ? "col-span-2 aspect-video" : ""
                                            )} onClick={() => { setActiveImage(i); setIsLightboxOpen(true); }}>
                                                <img
                                                    src={img}
                                                    alt={`Project view ${i + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* CURATED SELECTIONS - Horizontal Scroll (Alibaba Style) - MOVED HERE */}
                            <section className="mt-16 border-t border-border/30 pt-16">
                                <ScrollReveal>
                                    <h2 className="font-heading text-2xl text-foreground mb-10">Recommended Pairs</h2>
                                    <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                                        {relatedProducts.map((rp) => {
                                            const rpImage = rp.productImages?.length > 0
                                                ? rp.productImages[0].url
                                                : rp.images?.[0] || '/placeholder-tile.jpg';

                                            return (
                                                <Link
                                                    key={rp.id}
                                                    href={`/product/${rp.id}`}
                                                    className="group shrink-0 w-[200px] md:w-[240px]"
                                                >
                                                    <div className="overflow-hidden mb-4 border border-border aspect-square bg-gray-50">
                                                        <img
                                                            src={rpImage}
                                                            alt={rp.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-heading text-sm text-foreground group-hover:text-gold transition-colors truncate">{rp.name}</h4>
                                                        <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground">{rp.collection}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </ScrollReveal>
                            </section>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (25%) - Sticky Purchase Panel */}
                    <div className="lg:sticky lg:top-32 lg:self-start">
                        <div className="bg-white lg:border lg:border-border lg:p-8 lg:shadow-sm">
                            <ScrollReveal>
                                <p className="font-body text-xs tracking-widest uppercase text-gold mb-2">{product.collection}</p>
                                <h1 className="font-heading text-3xl text-foreground mb-4">{product.name}</h1>

                                <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-border/50">
                                    <span className="font-heading text-4xl text-foreground">D{currentPrice}</span>
                                    <span className="font-body text-sm text-muted-foreground">{product.unit}</span>
                                </div>

                                {/* Dimension & Texture Selector */}
                                {hasVariants && (
                                    <div className="mb-10 space-y-6">
                                        {/* Step 1: Choose Your Size */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">01. Choose Your Size</h3>
                                                {dimensions.length > 1 && <span className="font-body text-[9px] text-gold uppercase tracking-tighter italic">Selection Required</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {dimensions.map((dim) => (
                                                    <button
                                                        key={dim}
                                                        onClick={() => {
                                                            if (selectedDim === dim) {
                                                                setIsTextureRevealed(!isTextureRevealed);
                                                            } else {
                                                                setSelectedDim(dim);
                                                                setIsTextureRevealed(true);
                                                                setSelectedTex(null);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2.5 border font-body text-[10px] tracking-[0.15em] uppercase transition-all duration-300 min-w-[100px]",
                                                            selectedDim === dim
                                                                ? "bg-[#111] text-white border-[#111] shadow-lg shadow-black/10"
                                                                : "bg-white text-muted-foreground border-border hover:border-gold hover:text-gold"
                                                        )}
                                                    >
                                                        {dim}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step 2: Select Texture (Revealed only if textures exist for selected Dim AND Dim was clicked) */}
                                        <AnimatePresence mode="wait">
                                            {(hasTextures && isTextureRevealed) && (
                                                <motion.div
                                                    key={selectedDim}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4 pt-4 border-t border-border/30"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">02. Choose Your Look</h3>
                                                        <span className="font-body text-[9px] text-gold uppercase tracking-tighter leading-none">Price varies by finish</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentDimVariants.map((v: any) => {
                                                            const tex = (v.options as any)?.Texture || (v.title.includes(' / ') ? v.title.split(' / ')[1] : 'Standard');
                                                            const isSelected = selectedTex === tex || (selectedTex === null && tex === 'Standard');

                                                            return (
                                                                <button
                                                                    key={v.id}
                                                                    onClick={() => setSelectedTex(tex)}
                                                                    title={tex}
                                                                    className={cn(
                                                                        "px-3 py-2 border font-body text-[9px] tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-between gap-3 min-w-[130px] max-w-[180px]",
                                                                        isSelected
                                                                            ? "bg-gold/5 text-gold border-gold"
                                                                            : "bg-white text-gray-400 border-border hover:border-gray-300"
                                                                    )}
                                                                >
                                                                    <span className="truncate flex-1 text-left">{tex}</span>
                                                                    <span className="text-[8px] font-medium opacity-60 shrink-0">D{v.price}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Mobile-only Content Accordion */}
                                <div className="lg:hidden space-y-4 mb-8">
                                    <section className="border-b border-border pb-4">
                                        <button onClick={() => setMobileDescOpen(!mobileDescOpen)} className="w-full flex items-center justify-between py-2">
                                            <span className="font-body text-[10px] tracking-widest uppercase text-foreground">About This Tile</span>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform", mobileDescOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {mobileDescOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <p className="py-4 font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>

                                    <section className="border-b border-border pb-4">
                                        <button onClick={() => setMobileSpecsOpen(!mobileSpecsOpen)} className="w-full flex items-center justify-between py-2">
                                            <span className="font-body text-[10px] tracking-widest uppercase text-foreground">Technical Details</span>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform", mobileSpecsOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {mobileSpecsOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 space-y-2">
                                                    {Object.entries(product.techSpecs || {}).map(([l, v]) => (
                                                        <div key={l} className="flex justify-between text-[11px] font-body">
                                                            <span className="text-muted-foreground uppercase">{l}</span>
                                                            <span className="text-foreground">{v as string}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground italic">How much do you need?</label>
                                        <div className="flex items-center border border-border h-14 bg-gray-50/30">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-16 h-full font-body text-lg text-muted-foreground hover:text-foreground transition-colors border-r border-border"
                                            >
                                                −
                                            </button>
                                            <span className="flex-1 h-full flex items-center justify-center font-body text-sm text-foreground font-bold tracking-widest">
                                                {quantity} {product.unit}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-16 h-full font-body text-lg text-muted-foreground hover:text-foreground transition-colors border-l border-border"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddToCart}
                                                className="flex-[2] font-body text-[8px] tracking-[0.2em] uppercase py-4 transition-all duration-500 bg-primary text-primary-foreground hover:bg-gold hover:text-secondary-foreground shadow-xl shadow-primary/10 group flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart className="w-3 h-3 transition-transform group-hover:scale-110" />
                                                Request a Quote
                                            </button>
                                            <ConsultPopover
                                                product={product}
                                                variant={selectedVariant}
                                                quantity={quantity}
                                                selectedDim={selectedDim}
                                                selectedTex={selectedTex}
                                                trigger={
                                                    <button
                                                        className="flex-1 font-body text-[8px] tracking-[0.2em] uppercase py-4 transition-all duration-500 border border-border bg-transparent text-muted-foreground hover:border-gold hover:text-gold flex items-center justify-center gap-2"
                                                    >
                                                        Expert Advice
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </div>

                                    <p className="font-body text-[9px] uppercase tracking-widest text-center text-muted-foreground mt-4 leading-relaxed">
                                        * Final valuation established upon validation of logistics and site specificities.
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border p-4 z-50 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom duration-500 shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-[10px] font-body uppercase tracking-widest text-gold font-semibold">Estimated Total</span>
                    <span className="text-lg font-heading text-foreground">D{(currentPrice * quantity).toLocaleString()}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 font-body text-[10px] tracking-widest uppercase h-14 flex items-center justify-center gap-3 px-6 transition-all duration-300 bg-primary text-primary-foreground active:scale-95 shadow-lg shadow-primary/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Atelier Request
                </button>
            </div>

            <ImageLightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={galleryImages}
                currentIndex={activeImage}
                onNext={() => setActiveImage((activeImage + 1) % galleryImages.length)}
                onPrev={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)}
            />
        </div>
    );
}
