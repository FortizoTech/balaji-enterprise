'use client';

import { Mail, MessageSquare } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultPopoverProps {
    product: {
        id: string;
        name: string;
        description?: string;
        price?: number;
        unit?: string;
        images?: string[];
        productImages?: any[];
    };
    variant?: any;
    quantity?: number;
    selectedDim?: string | null;
    selectedTex?: string | null;
    trigger: React.ReactNode;
    className?: string;
}

export default function ConsultPopover({
    product,
    variant,
    quantity = 1,
    selectedDim,
    selectedTex,
    trigger,
    className
}: ConsultPopoverProps) {
    const whatsappNumber = "2202793008";

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'GMD',
            minimumFractionDigits: 0,
        }).format(val).replace('GMD', 'D');
    };

    const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.id}` : '';

    const message = `Hello Balaji Enterprise Atelier,

I’d like to request details for the following product:

━━━━━━━━━━━━━━━
📦 Product: ${product.name}
📐 Size: ${selectedDim || 'Standard'}
✨ Finish: ${selectedTex || 'Standard'}
📊 Quantity: ${quantity} ${product.unit || 'sqm'}
💰 Estimated Price: ${formatCurrency((variant?.price || product.price || 0) * quantity)}
━━━━━━━━━━━━━━━

🔗 View Product:
${pageUrl}

Please confirm:
• Availability
• Final pricing
• Delivery details

Thank you.

_Sent via Balaji Enterprise Digital Atelier — ${new Date().toLocaleString()}_`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    const emailUrl = `/inquiry?product=${product.id}${variant ? `&variant=${variant.id}` : ''}`;

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                {trigger}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-[110] outline-none"
                    sideOffset={5}
                    align="center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white border border-border shadow-2xl p-2 min-w-[200px] flex flex-col gap-1 rounded-sm"
                    >
                        <p className="font-body text-[9px] tracking-widest uppercase text-muted-foreground px-3 py-2 border-b border-border/50 mb-1">
                            Choose Channel
                        </p>
                        <button
                            onClick={() => window.location.href = emailUrl}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-gold hover:text-secondary-foreground transition-colors group rounded-sm text-left"
                        >
                            <Mail className="w-4 h-4 text-gold group-hover:text-secondary-foreground" />
                            <div className="flex flex-col">
                                <span className="font-body text-xs font-medium uppercase tracking-wider">Email Inquiry</span>
                                <span className="font-body text-[9px] opacity-70">Official Specification Form</span>
                            </div>
                        </button>
                        <button
                            onClick={() => window.open(whatsappUrl, '_blank')}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-green-500 hover:text-white transition-colors group rounded-sm text-left"
                        >
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                                <MessageSquare className="w-2.5 h-2.5 text-white group-hover:text-green-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-body text-xs font-medium uppercase tracking-wider">WhatsApp Chat</span>
                                <span className="font-body text-[9px] opacity-70">Instant Specialist Access</span>
                            </div>
                        </button>
                    </motion.div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
