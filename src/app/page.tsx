'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { getProducts } from '@/app/actions/admin';
const heroImage = '/assets/hero-tiles.jpg';
const interiorBathroom = '/assets/interior-bathroom.jpg';
const interiorKitchen = '/assets/interior-kitchen.jpg';
const interiorLiving = '/assets/interior-living.jpg';
const tileMarbleWhite = '/assets/tile-marble-white.jpg';
const tileBlackSlate = '/assets/tile-black-slate.jpg';
const tileConcrete = '/assets/tile-concrete.jpg';

import ConsultPopover from '@/components/ConsultPopover';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  useEffect(() => {
    getProducts({ limit: 4, status: 'ACTIVE' }).then(res => {
      if (res.products && res.products.length > 0) {
        // Map database products to the layout structure visually expected
        setFeaturedProducts(res.products.map(p => ({
          img: p.productImages && p.productImages.length > 0 ? p.productImages[0].url : p.images?.[0] || tileMarbleWhite,
          title: p.name,
          sub: p.collection,
          id: p.id
        })));
      }
    });
  }, []);

  const fallbackFeatured = [
    { img: tileMarbleWhite, title: 'Calacatta Oro', sub: 'Marble Series', id: 'calacatta-oro' },
    { img: tileBlackSlate, title: 'Noir Ardoise', sub: 'Stone Series', id: 'noir-ardoise' },
    { img: tileConcrete, title: 'Urban Concrete', sub: 'Industrial Series', id: 'urban-concrete' },
  ];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : fallbackFeatured;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury marble interior"
            className="w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex flex-col justify-center items-center text-center content-padding pb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-8 opacity-80">Balaji Enterprise Digital Atelier</p>
            <h1 className="font-heading text-display md:text-[8rem] leading-[0.9] text-primary-foreground mb-12 tracking-tighter">
              Bespoke<br />Surfaces
            </h1>
            <div className="flex flex-row justify-center gap-2 md:gap-6 mt-12 w-full md:w-auto px-4 md:px-0">
              <Link
                href="/collections"
                className="flex-1 md:flex-none text-center inline-block bg-primary text-primary-foreground border border-primary-foreground/20 font-body text-[9px] md:text-sm tracking-widest uppercase px-2 md:px-12 py-4 md:py-5 hover:bg-gold hover:text-secondary-foreground transition-all duration-500"
              >
                The Archive
              </Link>
              <Link
                href="/inspiration"
                className="flex-1 md:flex-none text-center inline-block bg-transparent text-primary-foreground border border-primary-foreground/40 font-body text-[9px] md:text-sm tracking-widest uppercase px-2 md:px-12 py-4 md:py-5 hover:bg-white/10 backdrop-blur-sm transition-all duration-500"
              >
                Lookbook
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-background content-padding overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <ScrollReveal direction="left">
                <p className="font-body text-xs tracking-widest uppercase text-gold mb-6 italic">The Philosophy</p>
                <h2 className="font-heading text-headline md:text-display-sm text-foreground mb-10 leading-tight">
                  Materials are the silent narrators of space.
                </h2>
                <div className="w-20 h-[1px] bg-gold mb-12" />
                <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-8">
                  Every tile in our collection is a convergence of natural beauty and engineered precision.
                  We source the world's finest materials and transform them into surfaces that elevate
                  architecture from structure to art.
                </p>
                <Link href="/about" className="font-body text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-2 hover:text-gold hover:border-gold transition-colors inline-block w-max">
                  Our Journey
                </Link>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.2}>
                <div className="relative aspect-[3/4] md:aspect-[16/10] overflow-hidden">
                  <img
                    src={interiorKitchen}
                    alt="Luxury kitchen"
                    className="w-full h-full object-cover scale-110"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Categorical Discovery */}
      <section className="py-24 bg-primary text-primary-foreground content-padding">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-20">
              <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">Discovery</p>
              <h2 className="font-heading text-headline">Explore by Application</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { title: 'Floor Tiles', slug: 'floor', img: interiorLiving },
              { title: 'Wall Tiles', slug: 'wall', img: tileBlackSlate },
              { title: 'Bathroom Surfaces', slug: 'bathroom', img: interiorBathroom },
              { title: 'Spanish Collection', slug: 'spanish', img: tileConcrete },
            ].map((cat, i) => (
              <ScrollReveal key={cat.slug} delay={i * 0.1}>
                <Link href={`/collections?cat=${cat.slug}`} className="group relative block aspect-[3/4] overflow-hidden">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="font-heading text-xl md:text-2xl mb-2">{cat.title}</h3>
                    <span className="font-body text-[10px] tracking-widest uppercase border-b border-white pb-1 group-hover:border-gold group-hover:text-gold transition-colors">Browse</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tiles */}
      <section className="section-padding bg-muted">
        <div className="content-padding">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">Featured</p>
              <h2 className="font-heading text-headline text-foreground">Signature Collections</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProducts.slice(0, 4).map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.15}>
                <div className="group relative">
                  {/* Absolute Link Overlay */}
                  <Link
                    href={`/product/${item.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View ${item.title}`}
                  />

                  {/* Visual Content */}
                  <div className="overflow-hidden mb-6">
                    <motion.img
                      src={item.img}
                      alt={item.title}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <h3 className="font-heading text-lg md:text-xl text-foreground group-hover:text-gold transition-colors">{item.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="font-body text-[10px] md:text-sm text-muted-foreground">{item.sub}</p>

                    {/* Interactive Layer */}
                    <div className="relative z-20">
                      <ConsultPopover
                        product={{ id: item.id, name: item.title }}
                        trigger={
                          <button className="font-body text-[9px] md:text-[10px] tracking-widest uppercase text-gold hover:text-foreground transition-colors px-2 py-1">
                            Consult
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Surface Finishes */}
      <section className="py-32 bg-background content-padding">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center p-8 text-center border border-border">
                  <span className="font-heading text-2xl mb-2 italic">Polished</span>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">High-Gloss Mirror Finish</p>
                </div>
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-8 text-center border border-border">
                  <span className="font-heading text-2xl mb-2 italic">Matte</span>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Natural Satin Texture</p>
                </div>
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-8 text-center border border-border">
                  <span className="font-heading text-2xl mb-2 italic">Lappato</span>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Semi-Polished Grit</p>
                </div>
                <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center p-8 text-center border border-border">
                  <span className="font-heading text-2xl mb-2 italic">Grip</span>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">R11 Anti-Slip Surface</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="order-1 lg:order-2">
            <ScrollReveal direction="right">
              <p className="font-body text-xs tracking-widest uppercase text-gold mb-6 italic">The Finish</p>
              <h2 className="font-heading text-headline md:text-display-sm text-foreground mb-10 leading-tight">
                Perfecting tactile perception.
              </h2>
              <p className="font-body text-body-lg text-muted-foreground leading-relaxed mb-8">
                The essence of a space resides in the touch. Our surfaces are curated with diverse finishes that dictate the light's interaction and the resident's comfort. From the sterile gloss of luxury hotels to the organic matte of residential havens.
              </p>
              <Link href="/collections" className="font-body text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-2 hover:text-gold hover:border-gold transition-colors inline-block w-max">
                View Finishes
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* NEW: New Arrivals Grid */}
      <section className="py-24 bg-muted/30 content-padding">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">The Latest</p>
                <h2 className="font-heading text-headline text-foreground">New Arrivals</h2>
              </div>
              <Link href="/collections" className="font-body text-[10px] tracking-widest uppercase text-muted-foreground hover:text-gold transition-colors border-b border-border hover:border-gold pb-1">
                View All Arrivals
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {displayProducts.map((item, i) => (
              <ScrollReveal key={`arrival-${item.id}`} delay={i * 0.1}>
                <Link href={`/product/${item.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden mb-4 bg-gray-100">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading text-sm text-foreground group-hover:text-gold transition-colors">{item.title}</h4>
                    <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground">{item.sub}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section className="section-padding content-padding">
        <ScrollReveal>
          <div className="text-center mb-20">
            <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">Inspiration</p>
            <h2 className="font-heading text-headline text-foreground">Designed for Every Space</h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollReveal>
            <div className="relative group overflow-hidden">
              <motion.img
                src={interiorBathroom}
                alt="Bathroom"
                className="w-full aspect-[3/4] md:aspect-[4/5] object-cover"
                loading="lazy"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-foreground/60 to-transparent">
                <p className="font-body text-xs tracking-widest uppercase text-primary-foreground/60 mb-2">Bathroom</p>
                <h3 className="font-heading text-2xl text-primary-foreground">Sanctuary of Calm</h3>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="relative group overflow-hidden">
              <motion.img
                src={interiorLiving}
                alt="Living room"
                className="w-full aspect-[3/4] md:aspect-[4/5] object-cover"
                loading="lazy"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-foreground/60 to-transparent">
                <p className="font-body text-xs tracking-widest uppercase text-primary-foreground/60 mb-2">Living</p>
                <h3 className="font-heading text-2xl text-primary-foreground">Elegant Foundation</h3>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary section-padding content-padding">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-headline text-primary-foreground mb-8">
              Transform Your Vision Into Reality
            </h2>
            <p className="font-body text-body-lg text-primary-foreground/60 mb-12 max-w-xl mx-auto">
              Browse our complete collection and discover surfaces that will define your space for generations.
            </p>
            <Link
              href="/collections"
              className="block w-full md:inline-block md:w-auto bg-gold text-secondary-foreground font-body text-xs md:text-sm tracking-widest uppercase px-6 py-5 md:px-12 hover:bg-gold/90 transition-colors"
            >
              View All Collections
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Index;
