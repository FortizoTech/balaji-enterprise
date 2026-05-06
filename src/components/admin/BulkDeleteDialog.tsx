'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface BulkDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    count: number;
    entityName: string;
    isDeleteAll?: boolean;
}

export function BulkDeleteDialog({ isOpen, onClose, onConfirm, count, entityName, isDeleteAll }: BulkDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isDeleting ? onClose : undefined}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-red-100"
                        >
                            <div className="p-8 text-center relative overflow-hidden">
                                {/* Subtle red glow behind icon */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />

                                <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-6 relative z-10 border border-red-100">
                                    {isDeleteAll ? (
                                        <ShieldAlert className="w-8 h-8 text-red-500" />
                                    ) : (
                                        <AlertTriangle className="w-8 h-8 text-red-500" />
                                    )}
                                </div>
                                <h3 className="font-heading text-2xl text-gray-900 mb-3 relative z-10">
                                    {isDeleteAll ? `Purge All ${entityName}` : `Delete ${count} ${entityName}`}
                                </h3>
                                <p className="text-sm font-body text-gray-500 mb-8 leading-relaxed relative z-10">
                                    {isDeleteAll
                                        ? `Are you absolutely certain you want to delete ALL ${entityName.toLowerCase()}? This is a highly destructive action that cannot be reversed. All related data will be permanently wiped.`
                                        : `Are you sure you want to delete the ${count} selected ${entityName.toLowerCase()}? This action cannot be reversed.`}
                                </p>
                                <div className="flex gap-3 relative z-10">
                                    <button
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3.5 text-xs font-body font-bold tracking-wider uppercase text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3.5 text-xs font-body font-bold tracking-wider uppercase text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                {isDeleteAll ? 'Purge All' : 'Delete'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
