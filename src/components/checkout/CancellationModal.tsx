'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    isProcessing?: boolean;
}

export default function CancellationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Withdraw Requisition",
    description = "Please share your reason for withdrawing this selection. This helps us refine our future curations.",
    confirmText = "Confirm Withdrawal",
    isProcessing = false
}: CancellationModalProps) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
        setReason("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-secondary border border-border overflow-hidden"
                    >
                        {/* Premium Accent Line */}
                        <div className="h-1 w-full bg-gradient-to-r from-gold/50 via-gold to-gold/50" />

                        <div className="p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-muted-foreground hover:text-gold transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                </div>
                                <h2 className="font-heading text-xl text-foreground uppercase tracking-widest">{title}</h2>
                            </div>

                            <p className="font-body text-xs text-muted-foreground leading-relaxed mb-8">
                                {description}
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Reason for Cancellation</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. Budget constraints, alternative selection, or change of project timeline..."
                                        rows={4}
                                        className="w-full bg-background border border-border px-4 py-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isProcessing}
                                        className="font-body text-[10px] tracking-[0.2em] uppercase py-5 border border-border hover:bg-muted transition-colors disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isProcessing}
                                        className="font-body text-[10px] tracking-[0.2em] uppercase py-5 bg-primary text-primary-foreground hover:bg-gold hover:text-secondary-foreground transition-all duration-500 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isProcessing ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : confirmText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
