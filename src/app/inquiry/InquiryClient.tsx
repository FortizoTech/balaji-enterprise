'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createInquiry } from '@/app/actions/inquiries';
import { getLatestOrderDetails } from '@/app/actions/orders';
import { toast } from 'sonner';

export default function InquiryClient({
    product,
    initialVariantId
}: {
    product: any,
    initialVariantId?: string
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const variantId = initialVariantId || searchParams.get('variant');

    const selectedVariant = product.variants?.find((v: any) => v.id === variantId) || null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        dimension: selectedVariant?.options?.Dimension || product.dimensions || 'Standard',
        texture: selectedVariant?.options?.Texture || 'Standard',
    });

    // Auto-populate user details
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user) return;

            try {
                // Pre-fill from session first
                setFormData(prev => ({
                    ...prev,
                    name: prev.name || session.user?.name || '',
                    email: prev.email || session.user?.email || '',
                }));

                // try to get more details from history
                const lastOrder = await getLatestOrderDetails((session.user as any).id);
                if (lastOrder) {
                    setFormData(prev => ({
                        ...prev,
                        name: prev.name || lastOrder.customerName || '',
                        email: prev.email || lastOrder.customerEmail || '',
                        phone: prev.phone || lastOrder.customerPhone || '',
                    }));
                }
            } catch (err) {
                console.error("Inquiry pre-fill error:", err);
            }
        };

        fetchUserData();
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await createInquiry({
                productId: product.id,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                message: formData.message,
                dimension: formData.dimension,
                texture: formData.texture,
            });

            if (res.success) {
                setIsSuccess(true);
                toast.success('Inquiry sent successfully');
                setTimeout(() => {
                    router.push(`/product/${product.id}`);
                }, 3000);
            } else {
                toast.error(res.error || 'Failed to send inquiry');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-md px-6"
                >
                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-gold" />
                    </div>
                    <h1 className="font-heading text-3xl text-foreground">Inquiry Received</h1>
                    <p className="font-body text-muted-foreground leading-relaxed">
                        Thank you for your interest in the <span className="text-foreground font-medium">{product.name}</span>.
                        Our team will review your request and get back to you shortly at <span className="text-foreground font-medium">{formData.email}</span>.
                    </p>
                    <div className="pt-8">
                        <Link
                            href={`/product/${product.id}`}
                            className="font-body text-[10px] tracking-[0.2em] uppercase text-gold hover:text-foreground transition-colors"
                        >
                            ← Return to Product
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Link
                href={`/product/${product.id}`}
                className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors mb-12"
            >
                <ArrowLeft className="w-3 h-3" />
                Back to {product.name}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="font-heading text-4xl md:text-5xl text-foreground tracking-tight uppercase">Send an Inquiry</h1>
                        <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">Request expert consultation and pricing for your curation</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Full Name *</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full h-14 bg-transparent border border-border px-4 font-body text-sm focus:outline-none focus:border-gold transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full h-14 bg-transparent border border-border px-4 font-body text-sm focus:outline-none focus:border-gold transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full h-14 bg-transparent border border-border px-4 font-body text-sm focus:outline-none focus:border-gold transition-colors"
                                placeholder="+220 --- ----"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Your Message *</label>
                            <textarea
                                required
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full bg-transparent border border-border p-4 font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                                placeholder="I would like to know more about pricing and lead times for this selection..."
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-primary-foreground font-body text-[10px] tracking-[0.3em] uppercase py-6 flex items-center justify-center gap-3 hover:bg-gold hover:text-secondary-foreground transition-all duration-500 shadow-xl shadow-gold/10"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending Request...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Transmit Inquiry
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-12 lg:sticky lg:top-32 h-fit">
                    <div className="bg-muted/30 border border-border/50 p-8 space-y-8">
                        <div className="space-y-2">
                            <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground border-b border-border/30 pb-4 mb-6">Subject Specification</p>
                            <div className="flex gap-6 items-start">
                                <div className="w-20 h-20 bg-muted shrink-0 overflow-hidden">
                                    <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg text-foreground">{product.name}</h3>
                                    <p className="font-body text-[10px] tracking-widest uppercase text-gold mt-1">{product.collection}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground">Dimension</p>
                                <p className="font-body text-xs text-foreground font-medium uppercase">{formData.dimension}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground">Texture</p>
                                <p className="font-body text-xs text-foreground font-medium uppercase">{formData.texture}</p>
                            </div>
                        </div>

                        <div className="bg-white/50 border border-border p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                <p className="font-body text-[11px] leading-relaxed text-muted-foreground">
                                    Inquiries are reviewed by our atelier specialists within 24 hours. Pricing includes VAT but excludes specific logistics costs which will be discussed following your request.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 text-center">
                        <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Direct Assistance</p>
                        <p className="font-heading text-xl text-foreground">+220 2793008</p>
                        <p className="font-body text-[10px] tracking-widest uppercase text-gold">sahoebrahema1@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
