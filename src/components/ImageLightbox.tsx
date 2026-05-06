'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useEffect } from 'react';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

export default function ImageLightbox({
    isOpen,
    onClose,
    images,
    currentIndex,
    onNext,
    onPrev,
}: ImageLightboxProps) {

    // Disable scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 select-none"
                >
                    {/* Controls Overlay */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {/* Top Bar */}
                        <div className="w-full p-6 flex justify-between items-center pointer-events-auto">
                            <div className="flex flex-col">
                                <p className="font-body text-[10px] tracking-widest uppercase text-gold">Immersive View</p>
                                <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                                    {currentIndex + 1} <span className="text-muted-foreground/30 mx-2">/</span> {images.length}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full transition-all group"
                            >
                                <X className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <div className="flex-1 flex items-center justify-between px-6 pointer-events-none">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                    className="w-16 h-16 flex items-center justify-center bg-background/10 hover:bg-background/20 backdrop-blur-md border border-foreground/10 rounded-full transition-all pointer-events-auto group"
                                >
                                    <ChevronLeft className="w-6 h-6 text-foreground group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                                    className="w-16 h-16 flex items-center justify-center bg-background/10 hover:bg-background/20 backdrop-blur-md border border-foreground/10 rounded-full transition-all pointer-events-auto group"
                                >
                                    <ChevronRight className="w-6 h-6 text-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {/* Bottom Info */}
                        <div className="w-full p-8 flex justify-center pointer-events-auto">
                            <div className="bg-foreground/5 backdrop-blur-xl border border-foreground/10 px-6 py-2 rounded-full hidden md:block">
                                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground italic">
                                    Escape to exit <span className="mx-3 opacity-20">|</span> Arrow keys to navigate
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Image */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`View ${currentIndex + 1}`}
                            className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
