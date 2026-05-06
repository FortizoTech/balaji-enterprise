'use client';

import { useState, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
    Upload, X, GripVertical, Type, Trash2, Loader2,
    Image as ImageIcon, CheckCircle2, AlertCircle, Link as LinkIcon, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
    id: string;
    url: string;
    alt: string;
    isUploading?: boolean;
    error?: string;
}

interface MediaManagerProps {
    images: MediaItem[];
    onReorder: (newOrder: MediaItem[]) => void;
    onUpload: (files: FileList) => Promise<void>;
    onAddUrl: (url: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onUpdateAlt: (id: string, alt: string) => Promise<void>;
}

export default function MediaManager({
    images,
    onReorder,
    onUpload,
    onAddUrl,
    onDelete,
    onUpdateAlt
}: MediaManagerProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [editingAlt, setEditingAlt] = useState<string | null>(null);
    const [tempAlt, setTempAlt] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files?.length > 0) {
            onUpload(e.dataTransfer.files);
        }
    }, [onUpload]);

    const handleUrlSubmit = useCallback(async () => {
        if (urlInput.trim()) {
            await onAddUrl(urlInput.trim());
            setUrlInput('');
            setShowUrlInput(false);
        }
    }, [urlInput, onAddUrl]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            onUpload(e.target.files);
            // Reset value so same files can be selected again
            e.target.value = '';
        }
    }, [onUpload]);

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 group cursor-pointer",
                    isDraggingOver
                        ? "border-[#C5A572] bg-[#C5A572]/5 scale-[0.99]"
                        : "border-gray-200 hover:border-[#C5A572]/50 hover:bg-gray-50/50"
                )}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                />
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#C5A572]" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-body font-medium text-gray-700">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs font-body text-gray-400">
                            SVG, PNG, JPG or GIF (max. 800x400px)
                        </p>
                    </div>
                </div>
            </div>

            {/* URL Input Fallback */}
            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#C5A572] font-body hover:opacity-80 transition-opacity self-start"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Or Add Image via URL</span>
                </button>

                <AnimatePresence>
                    {showUrlInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <LinkIcon className="w-4 h-4 text-gray-400 ml-2" />
                                <input
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-body text-gray-600 placeholder:text-gray-300"
                                    placeholder="Paste image URL (e.g. https://...)"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                                />
                                <button
                                    type="button"
                                    onClick={handleUrlSubmit}
                                    disabled={!urlInput.trim()}
                                    className="bg-[#111] text-white px-4 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-body hover:bg-[#C5A572] transition-colors disabled:opacity-30"
                                >
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gallery Grid */}
            <Reorder.Group
                axis="y"
                values={images}
                onReorder={onReorder}
                className="grid grid-cols-1 gap-3"
            >
                <AnimatePresence initial={false}>
                    {images.map((image, index) => (
                        <Reorder.Item
                            key={image.id}
                            value={image}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "group bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-4 hover:border-[#C5A572]/30 hover:shadow-sm transition-all relative overflow-hidden",
                                image.error && "border-red-100 bg-red-50/30"
                            )}
                        >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                />
                                {image.isUploading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 className="w-5 h-5 text-[#C5A572] animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-body tracking-wider uppercase px-2 py-0.5 rounded-full border",
                                        index === 0
                                            ? "bg-[#C5A572]/10 text-[#C5A572] border-[#C5A572]/20"
                                            : "bg-gray-50 text-gray-400 border-gray-100"
                                    )}>
                                        {index === 0 ? 'Cover Image' : `Image ${index + 1}`}
                                    </span>
                                    {image.error && (
                                        <span className="flex items-center gap-1 text-[10px] font-body text-red-500">
                                            <AlertCircle className="w-3 h-3" />
                                            {image.error}
                                        </span>
                                    )}
                                </div>

                                {editingAlt === image.id ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={tempAlt}
                                            onChange={(e) => setTempAlt(e.target.value)}
                                            onBlur={() => {
                                                onUpdateAlt(image.id, tempAlt);
                                                setEditingAlt(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onUpdateAlt(image.id, tempAlt);
                                                    setEditingAlt(null);
                                                }
                                            }}
                                            className="w-full text-sm font-body border-b border-[#C5A572] focus:outline-none py-0.5 text-gray-700 bg-transparent"
                                            placeholder="Enter alt text..."
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingAlt(image.id);
                                            setTempAlt(image.alt);
                                        }}
                                        className="mt-1.5 flex items-center gap-1.5 text-xs font-body text-gray-400 hover:text-gray-600 transition-colors text-left"
                                    >
                                        <Type className="w-3 h-3" />
                                        {image.alt || 'Add alt text...'}
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onDelete(image.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                    title="Delete image"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {images.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                    <p className="text-sm font-body text-gray-400">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
}
