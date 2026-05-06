'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title,
    description
}: SuccessModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white border border-border shadow-2xl overflow-hidden"
                    >
                        {/* Premium Accent Line */}
                        <div className="h-1.5 w-full bg-gold" />

                        <div className="p-10 text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gold transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8 flex justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-gold" />
                                </motion.div>
                            </div>

                            <h2 className="font-heading text-2xl text-gray-900 uppercase tracking-tight mb-4">{title}</h2>
                            <p className="font-body text-xs text-gray-500 leading-relaxed mb-10 px-4">
                                {description}
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-gray-900 text-white font-body text-[10px] tracking-[0.3em] uppercase hover:bg-gold transition-all duration-500"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
