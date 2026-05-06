'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pt-24 md:pt-32 min-h-screen">
      <section className="content-padding py-12 md:py-20 text-center md:text-left">
        <ScrollReveal>
          <div className="mb-12 md:mb-20">
            <h1 className="font-heading text-display-sm md:text-display text-foreground mb-4">Your Atelier Curations</h1>
            <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">
              {items.length === 0 ? 'Explore our collections to begin' : `${items.length} Unique items selected`}
            </p>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-32 border border-dashed border-border">
              <p className="font-body text-body-lg text-muted-foreground mb-8">The atelier is currently empty</p>
              <Link
                href="/collections"
                className="block w-full md:inline-block md:w-auto bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase px-4 py-5 md:px-12 hover:bg-gold hover:text-secondary-foreground transition-all duration-500"
              >
                Browse Collections
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="border-t border-border">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.cartItemId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                      className="border-b border-border py-10"
                    >
                      <div className="flex flex-row gap-4 md:gap-8 items-start">
                        <Link href={`/product/${item.product.id}`} className="shrink-0 group relative overflow-hidden bg-muted w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40">
                          <img
                            src={item.product.images?.[0] || ''}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <Link href={`/product/${item.product.id}`}>
                                <h3 className="font-heading text-base md:text-2xl text-foreground hover:text-gold transition-colors truncate">{item.product.name}</h3>
                              </Link>
                              <div className="mt-1 flex flex-wrap gap-x-2 md:gap-x-4 gap-y-1">
                                {item.variant && (
                                  <span className="font-body text-[9px] md:text-[10px] tracking-widest uppercase text-gold truncate block">{item.variant.title}</span>
                                )}
                                <span className="font-body text-[9px] md:text-[10px] tracking-widest uppercase text-muted-foreground truncate block">{item.product.collection}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-border bg-muted/20">
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                  className="px-2 py-1 md:px-4 md:py-2 font-body text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  −
                                </button>
                                <span className="px-3 py-1 md:px-5 md:py-2 font-body text-xs md:text-sm text-foreground min-w-[2rem] md:min-w-[3rem] text-center font-bold tracking-tighter">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                  className="px-2 py-1 md:px-4 md:py-2 font-body text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-heading text-lg md:text-2xl text-foreground">
                                D{(item.variant ? item.variant.price : item.product.price) * item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 mt-16 lg:mt-0">
              <div className="sticky top-32">
                <div className="bg-muted/30 border border-border p-8 md:p-10 backdrop-blur-sm shadow-sm">
                  <h2 className="font-heading text-xl text-foreground mb-8 pb-4 border-b border-border/50 tracking-widest uppercase">Order Summary</h2>

                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between text-muted-foreground font-body text-[11px] tracking-widest uppercase">
                      <span>Subtotal</span>
                      <span>D{total()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-body text-[11px] tracking-widest uppercase">
                      <span>Logistics</span>
                      <span className="text-gold">Calculated after validation</span>
                    </div>
                    <div className="pt-6 border-t border-border/50 flex justify-between items-end">
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground font-bold">Total Estimate</span>
                      <span className="font-heading text-4xl text-foreground">D{total()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex items-center justify-center w-full bg-primary text-primary-foreground font-body text-[10px] tracking-[0.3em] uppercase py-6 hover:bg-gold hover:text-secondary-foreground transition-all duration-500 shadow-xl shadow-gold/10"
                  >
                    Submit Order Request
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
