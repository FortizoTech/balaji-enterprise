'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productUpdateSchema, type ProductUpdateInput } from '@/lib/validations';
import {
    updateProduct, deleteProduct, saveProductVariants,
    uploadFile, addProductImage, deleteProductImage,
    updateMediaPositions, updateImageAltText
} from '@/app/actions/admin';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, Check, Edit, Eye, EyeOff, Package, Image as ImageIcon,
    DollarSign, FileText, Settings, Search, Plus, X, ChevronDown, ChevronUp,
    ExternalLink, AlertTriangle, Tag, Ruler, Paintbrush, Layers, Grid3X3,
    Globe, Info, RefreshCw, Wrench
} from 'lucide-react';
import MediaManager, { type MediaItem } from '@/components/admin/MediaManager';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ProductPreview from '@/components/admin/ProductPreview';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Shared UI Primitives ─────────────────────────────────────

function Section({ title, icon: Icon, children, isOpen, onToggle }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
}) {
    const [localOpen, setLocalOpen] = useState(true);
    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : localOpen;
    const toggle = isControlled ? onToggle : () => setLocalOpen(!localOpen);

    return (
        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden transition-all duration-300">
            <button
                type="button"
                onClick={toggle}
                className="w-full px-5 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-[13px] md:text-sm font-body font-medium text-gray-700">{title}</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
            </button>
            {open && (
                <div className="px-5 md:px-6 pb-6 border-t border-[#F0F0F0] pt-5">
                    {children}
                </div>
            )}
        </div>
    );
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-body tracking-wider uppercase text-gray-400 block">{label}</label>
            {children}
            {hint && !error && <p className="text-[10px] font-body text-gray-300">{hint}</p>}
            {error && <p className="text-[10px] font-body text-red-500">{error}</p>}
        </div>
    );
}

const inputClass = "w-full border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm font-body text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572]/20 transition-all";
const selectClass = "w-full border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm font-body text-gray-700 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572]/20 transition-all bg-white";

function StatusBadge({ status }: { status: string }) {
    const color = status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-100'
            : 'bg-gray-50 text-gray-400 border-gray-100';
    return <span className={`text-[10px] font-body tracking-wider uppercase px-3 py-1 rounded-full border ${color}`}>{status}</span>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-[#F5F5F5] last:border-0">
            <span className="text-[11px] font-body tracking-wider uppercase text-gray-400">{label}</span>
            <span className="text-[13px] font-body text-gray-700 text-right max-w-[60%]">{value || '—'}</span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// VIEW TAB
// ═══════════════════════════════════════════════════════════════

function ProductViewTab({ product }: { product: any }) {
    const variants = product.variants || [];
    const hasVariants = variants.length > 0;
    const priceRange = hasVariants
        ? { min: Math.min(...variants.map((v: any) => v.price)), max: Math.max(...variants.map((v: any) => v.price)) }
        : null;

    const images = product.productImages?.length > 0
        ? [...(product.productImages)].sort((a: any, b: any) => a.position - b.position)
        : (product.images || []).map((url: string) => ({ url, alt: '' }));

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
                    <div className="aspect-[16/10] bg-[#F5F5F5] relative overflow-hidden">
                        {images[0] ? (
                            <img src={images[0].url} alt={images[0].alt || product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-200" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Pricing</span>
                            <DollarSign className="w-3.5 h-3.5 text-[#C5A572]" />
                        </div>
                        {hasVariants ? (
                            <>
                                <p className="text-2xl font-heading text-gray-900 tracking-tight">
                                    D{priceRange!.min.toLocaleString()} — D{priceRange!.max.toLocaleString()}
                                </p>
                            </>
                        ) : (
                            <p className="text-3xl font-heading text-gray-900 tracking-tight">D{product.price?.toLocaleString()}</p>
                        )}
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Inventory</span>
                            <Layers className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-body text-gray-400">Available</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Classification</span>
                            <Tag className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                        <DetailRow label="Category" value={<span className="capitalize">{product.category}</span>} />
                        <DetailRow label="Collection" value={product.collection} />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-body font-medium text-gray-700">Description</span>
                </div>
                <div className="text-sm font-body text-gray-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description provided.' }} />
            </div>
        </div >
    );
}

// ═══════════════════════════════════════════════════════════════
// EDIT TAB (Split Screen + Auto-Save)
// ═══════════════════════════════════════════════════════════════

function ProductEditTab({ product, onSaved }: { product: any; onSaved: () => void }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [activeSection, setActiveSection] = useState<string | null>('media');
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const toggleSection = (id: string) => {
        // Only enforce "one at a time" logic on mobile if screens are small
        // For simplicity, we manage one state, but UI can decide to ignore it on desktop if we wanted.
        // The user specifically asked for "Show only one section at a time" in PRODUCT FORM (MOBILE ONLY).
        setActiveSection(activeSection === id ? null : id);
    };

    const [detailsList, setDetailsList] = useState<string[]>(product.details?.length ? product.details : ['']);
    const [installList, setInstallList] = useState<string[]>(product.installation?.length ? product.installation : ['']);
    const [techSpecsList, setTechSpecsList] = useState<{ key: string, value: string }[]>(() => {
        const specs = product.techSpecs || {};
        const entries = Object.entries(specs);
        return entries.length > 0 ? entries.map(([k, v]) => ({ key: k, value: String(v) })) : [{ key: '', value: '' }];
    });

    // Variants State
    const [variants, setVariants] = useState<any[]>(
        product.variants?.map((v: any) => ({
            id: v.id, title: v.title, price: v.price, sku: v.sku || '', options: v.options || {}
        })) || []
    );

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductUpdateInput>({
        resolver: zodResolver(productUpdateSchema),
        defaultValues: {
            name: product.name, status: product.status, price: product.price, unit: product.unit,
            collection: product.collection, category: product.category, description: product.description,
            dimensions: product.dimensions || '', material: product.material || '', finish: product.finish || '',
            seoTitle: product.seoTitle || '', seoDescription: product.seoDescription || '',
        },
    });

    const watchedValues = watch();

    // Auto-save logic (debounced)
    const debouncedValues = useDebounce(watchedValues, 2000);
    const debouncedVariants = useDebounce(variants, 2000);
    const debouncedDetails = useDebounce(detailsList, 2000);
    const debouncedInstall = useDebounce(installList, 2000);
    const debouncedSpecs = useDebounce(techSpecsList, 2000);

    const onSubmit = async (data: ProductUpdateInput) => {
        setSavedStatus('saving');
        try {
            if (variants.length > 0) {
                data.price = Math.min(...variants.filter(v => v.price > 0).map(v => v.price));
            }
            data.details = detailsList.filter(Boolean);
            data.installation = installList.filter(Boolean);

            const specsMap: Record<string, string> = {};
            techSpecsList.forEach(s => {
                if (s.key.trim() && s.value.trim()) specsMap[s.key.trim()] = s.value.trim();
            });
            data.techSpecs = specsMap;

            await updateProduct(product.id, data);
            await saveProductVariants(product.id, variants.filter(v => v.title && v.price > 0));

            setSavedStatus('saved');
            setTimeout(() => setSavedStatus('idle'), 3000);
            router.refresh();
        } catch (err) {
            console.error("Auto-save failed", err);
            setSavedStatus('idle');
        }
    };

    useEffect(() => {
        if (!watchedValues.name) return;
        onSubmit(watchedValues);
    }, [debouncedValues, debouncedVariants, debouncedSpecs, debouncedInstall, debouncedDetails]);

    // Media State
    const [media, setMedia] = useState<MediaItem[]>(() => {
        if (product.productImages?.length > 0) {
            return product.productImages.map((img: any) => ({
                id: img.id, url: img.url, alt: img.alt || ''
            }));
        }
        // Fallback to legacy images array
        return (product.images || []).map((url: string, index: number) => ({
            id: `legacy-${index}`, url, alt: ''
        }));
    });

    // Media Handlers
    const handleUpload = async (files: FileList) => {
        if (!files || files.length === 0) return;
        setSavedStatus('saving');
        console.log('--- ProductDetail HANDLE UPLOAD ---', files.length, 'files');

        // 1. Create Optimistic Previews
        const tempItems: (MediaItem & { tempFile: File })[] = [];
        const basePosition = media.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;

            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            tempItems.push({
                id: tempId,
                url: URL.createObjectURL(file), // Local preview
                alt: '',
                isUploading: true,
                tempFile: file
            });
        }

        // Add placeholders to UI immediately
        setMedia(prev => [...prev, ...tempItems.map(({ tempFile, ...rest }) => rest)]);

        // 2. Process Uploads Sequentially
        for (let i = 0; i < tempItems.length; i++) {
            const tempItem = tempItems[i];
            const file = tempItem.tempFile;

            try {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await uploadFile(formData);
                if (uploadRes.success && uploadRes.url) {
                    const addRes = await addProductImage(product.id, {
                        url: uploadRes.url,
                        position: basePosition + i
                    });

                    if (addRes.success && addRes.image) {
                        setMedia(prev => prev.map(m => m.id === tempItem.id ? {
                            id: addRes.image!.id,
                            url: addRes.image!.url,
                            alt: addRes.image!.alt,
                            isUploading: false
                        } : m));
                        toast.success(`Uploaded ${file.name}`);
                    } else {
                        throw new Error(addRes.error || 'Failed to add image to database');
                    }
                } else {
                    throw new Error(uploadRes.error || 'File upload failed');
                }
            } catch (error: any) {
                console.error("Upload process failed:", error);
                setMedia(prev => prev.map(m => m.id === tempItem.id ? {
                    ...m,
                    isUploading: false,
                    error: error.message || 'Upload failed'
                } : m));
                toast.error(`Failed to upload ${file?.name || 'file'}: ${error.message || 'Unknown error'}`);
            }
        }
        setSavedStatus('saved');
        setTimeout(() => setSavedStatus('idle'), 2000);
        router.refresh();
    };

    const handleAddUrl = async (url: string) => {
        setSavedStatus('saving');
        try {
            const addRes = await addProductImage(product.id, {
                url,
                position: media.length
            });

            if (addRes.success && addRes.image) {
                setMedia(prev => [...prev, {
                    id: addRes.image!.id,
                    url: addRes.image!.url,
                    alt: addRes.image!.alt
                }]);
                toast.success('Image added via URL');
            } else {
                toast.error(addRes.error || 'Failed to add image URL');
            }
        } catch (error: any) {
            toast.error(`Error adding URL: ${error.message}`);
        }
        setSavedStatus('saved');
        setTimeout(() => setSavedStatus('idle'), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
            {/* Form Column */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="sticky top-5 z-20 flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg px-4 md:px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        {savedStatus === 'saving' && <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-body"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>}
                        {savedStatus === 'saved' && <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-500 font-body"><Check className="w-3 h-3" /> Changes Saved</span>}
                        {savedStatus === 'idle' && <span className="text-[10px] uppercase tracking-wider text-gray-300 font-body">Ready</span>}
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={() => setShowMobilePreview(!showMobilePreview)}
                            className="lg:hidden flex items-center gap-2 text-gray-600 px-4 py-2 text-[10px] tracking-wider uppercase font-body hover:bg-gray-50 transition-colors rounded-md border border-gray-200"
                        >
                            {showMobilePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>Preview</span>
                        </button>
                        <button type="submit" className="inline-flex items-center gap-2 bg-[#111] text-white px-5 md:px-6 py-2 text-[10px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md">
                            <Save className="w-3.5 h-3.5" /> <span className="hidden md:inline">Force Save</span><span className="md:hidden">Save</span>
                        </button>
                    </div>
                </div>

                <Section
                    title="Media Gallery"
                    icon={ImageIcon}
                    isOpen={activeSection === 'media'}
                    onToggle={() => toggleSection('media')}
                >
                    <MediaManager
                        images={media}
                        onUpload={handleUpload}
                        onAddUrl={handleAddUrl}
                        onDelete={async (id) => { await deleteProductImage(id); setMedia(m => m.filter(x => x.id !== id)); }}
                        onUpdateAlt={async (id, alt) => { await updateImageAltText(id, alt); setMedia(m => m.map(x => x.id === id ? { ...x, alt } : x)); }}
                        onReorder={async (n) => { setMedia(n); await updateMediaPositions(product.id, n.map(x => x.id)); }}
                    />
                </Section>

                <Section
                    title="Core Details"
                    icon={Package}
                    isOpen={activeSection === 'core'}
                    onToggle={() => toggleSection('core')}
                >
                    <div className="space-y-4">
                        <Field label="Product Name" error={errors.name?.message}><input {...register('name')} className={inputClass} /></Field>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Status"
                                hint="Draft (Hidden), Active (Live), Archived (Hidden/Old)"
                            >
                                <select {...register('status')} className={selectClass}>
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Collection"><input {...register('collection')} className={inputClass} /></Field>
                            <Field label="Category"><select {...register('category')} className={selectClass}><option value="floor">Floor</option><option value="wall">Wall</option><option value="bathroom">Bathroom</option></select></Field>
                        </div>
                        <Field label="Base Price" error={errors.price?.message} hint="Minimum price shown in listing summaries">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">D</span>
                                <input type="number" {...register('price', { valueAsNumber: true })} className={cn(inputClass, "pl-7")} />
                            </div>
                        </Field>
                    </div>
                </Section>

                <Section
                    title="Description"
                    icon={FileText}
                    isOpen={activeSection === 'description'}
                    onToggle={() => toggleSection('description')}
                >
                    <RichTextEditor content={watchedValues.description || ''} onChange={(val) => setValue('description', val)} />
                </Section>

                <Section
                    title="Specifications"
                    icon={Info}
                    isOpen={activeSection === 'specs'}
                    onToggle={() => toggleSection('specs')}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Finish"><input {...register('finish')} className={inputClass} placeholder="e.g. Polished" /></Field>
                            <Field label="Material"><input {...register('material')} className={inputClass} placeholder="e.g. Porcelain" /></Field>
                            <div className="md:col-span-2">
                                <Field label="Primary Size" hint="Main size shown in listing"><input {...register('dimensions')} className={inputClass} placeholder="e.g. 60x60 cm" /></Field>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gray-400">Dynamic Specifications</p>
                            {techSpecsList.map((spec, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                                    <input value={spec.key} onChange={e => { const n = [...techSpecsList]; n[i].key = e.target.value; setTechSpecsList(n); }} className={cn(inputClass, "w-full md:w-1/3")} placeholder="Feature (e.g. Weight)" />
                                    <div className="w-full flex-1 flex gap-2">
                                        <input value={spec.value} onChange={e => { const n = [...techSpecsList]; n[i].value = e.target.value; setTechSpecsList(n); }} className={inputClass} placeholder="Value (e.g. 20kg/sqm)" />
                                        <button type="button" onClick={() => setTechSpecsList(techSpecsList.filter((_, k) => k !== i))} className="p-2 text-gray-300 hover:text-red-500 rounded transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => setTechSpecsList([...techSpecsList, { key: '', value: '' }])} className="text-[10px] font-body uppercase tracking-wider text-[#C5A572] flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Specification</button>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Installation Guide"
                    icon={Wrench}
                    isOpen={activeSection === 'install'}
                    onToggle={() => toggleSection('install')}
                >
                    <div className="space-y-3">
                        <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gray-400">Step-by-step Installation Instructions</p>
                        {installList.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-6 h-6 mt-1.5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-mono flex-shrink-0">{i + 1}</div>
                                <div className="flex-1 flex gap-2">
                                    <input value={step} onChange={e => { const n = [...installList]; n[i] = e.target.value; setInstallList(n); }} className={inputClass} placeholder="e.g. Stone-specific epoxy adhesive recommended" />
                                    <button type="button" onClick={() => setInstallList(installList.filter((_, k) => k !== i))} className="p-2 text-gray-300 hover:text-red-500 rounded transition-all mt-0.5"><X className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => setInstallList([...installList, ''])} className="text-[10px] font-body uppercase tracking-wider text-[#C5A572] flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Step</button>
                    </div>
                </Section>

                <Section
                    title="Dimensions & Pricing Matrix"
                    icon={Grid3X3}
                    isOpen={activeSection === 'variants'}
                    onToggle={() => toggleSection('variants')}
                >
                    <div className="space-y-6">
                        {/* New Hierarchical Builder */}
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gray-400">Atelier Pricing Matrix</p>
                            <button
                                type="button"
                                onClick={() => {
                                    const newDim = "New Dimension";
                                    setVariants([...variants, { title: newDim, price: 0, options: { Dimension: newDim, Texture: '' } }]);
                                }}
                                className="text-[10px] font-body uppercase tracking-wider text-[#C5A572] flex items-center gap-1.5 hover:underline"
                            >
                                <Plus className="w-3 h-3" /> Add Dimension
                            </button>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(variants.reduce((acc, v) => {
                                const gid = v.groupId || `id-${(v.options?.Dimension || v.title.split(' / ')[0]).replace(/\s+/g, '-')}`;
                                if (!acc[gid]) acc[gid] = [];
                                acc[gid].push(v);
                                return acc;
                            }, {} as Record<string, any[]>)).map(([groupId, dimsVariants], dimIdx) => {
                                const firstVariant = (dimsVariants as any[])[0];
                                const dim = firstVariant.options?.Dimension || firstVariant.title.split(' / ')[0];
                                const hasTexture = (dimsVariants as any[]).some(v => v.options?.Texture || v.title.includes(' / '));

                                return (
                                    <div key={groupId} className="bg-gray-50/50 rounded-lg border border-gray-100 p-4 space-y-4">
                                        {/* Dimension Header */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center">
                                                    <Grid3X3 className="w-4 h-4 text-[#C5A572]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-body text-gray-400 uppercase tracking-wider leading-none mb-1">Dimension</p>
                                                    <input
                                                        className="text-[14px] font-heading text-gray-800 bg-transparent border-none p-0 focus:ring-0 w-32"
                                                        value={dim}
                                                        onChange={(e) => {
                                                            const newDim = e.target.value;
                                                            setVariants(variants.map(v => {
                                                                if (v.groupId === groupId || (v.options?.Dimension === dim && !v.groupId)) {
                                                                    const tex = v.options?.Texture || (v.title.includes(' / ') ? v.title.split(' / ')[1] : '');
                                                                    return {
                                                                        ...v,
                                                                        groupId,
                                                                        title: tex ? `${newDim} / ${tex}` : newDim,
                                                                        options: { ...v.options, Dimension: newDim }
                                                                    };
                                                                }
                                                                return v;
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-body text-gray-400 uppercase">Has Textures?</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (hasTexture) {
                                                                const first = (dimsVariants as any[])[0];
                                                                const otherVariants = variants.filter(v => v.groupId !== groupId && (v.options?.Dimension !== dim || v.groupId));
                                                                setVariants([...otherVariants, {
                                                                    ...first,
                                                                    groupId,
                                                                    title: dim,
                                                                    options: { ...first.options, Texture: '' }
                                                                }]);
                                                            } else {
                                                                const first = (dimsVariants as any[])[0];
                                                                setVariants(variants.map(v => (v.id === first.id || v === first) ? {
                                                                    ...v,
                                                                    groupId,
                                                                    title: `${dim} / Matte`,
                                                                    options: { ...v.options, Texture: 'Matte' }
                                                                } : v));
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-8 h-4 rounded-full transition-colors relative",
                                                            hasTexture ? "bg-[#C5A572]" : "bg-gray-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                                                            hasTexture ? "left-4.5" : "left-0.5"
                                                        )} />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setVariants(variants.filter(v => v.groupId !== groupId && (v.options?.Dimension !== dim || v.groupId)))}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        {!hasTexture ? (
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[9px] font-body text-gray-400 uppercase">Universal Price (D)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300">D</span>
                                                        <input
                                                            type="number"
                                                            className={cn(inputClass, "pl-7 py-2 text-[12px]")}
                                                            value={(dimsVariants as any[])[0].price}
                                                            onChange={(e) => {
                                                                const p = parseFloat(e.target.value);
                                                                setVariants(variants.map(v => (v.id === (dimsVariants as any[])[0].id || v === (dimsVariants as any[])[0]) ? { ...v, price: p } : v));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {(dimsVariants as any[]).map((v, i) => (
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_40px] gap-3 items-end">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-body text-gray-400 uppercase">Texture Name</label>
                                                            <input
                                                                className={cn(inputClass, "py-1.5 text-[11px]")}
                                                                placeholder="e.g. Polished"
                                                                value={v.options?.Texture || v.title.split(' / ')[1]}
                                                                onChange={(e) => {
                                                                    const tex = e.target.value;
                                                                    setVariants(variants.map(curr => (curr.id === v.id || curr === v) ? {
                                                                        ...curr,
                                                                        title: `${dim} / ${tex}`,
                                                                        options: { ...curr.options, Texture: tex }
                                                                    } : curr));
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-body text-gray-400 uppercase">Price (D)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-300">D</span>
                                                                <input
                                                                    type="number"
                                                                    className={cn(inputClass, "pl-6 py-1.5 text-[11px]")}
                                                                    value={v.price}
                                                                    onChange={(e) => {
                                                                        const p = parseFloat(e.target.value);
                                                                        setVariants(variants.map(curr => (curr.id === v.id || curr === v) ? { ...curr, price: p } : curr));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pb-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if ((dimsVariants as any[]).length === 1) {
                                                                        // Last texture, disable texture mode
                                                                        setVariants(variants.map(curr => (curr.id === v.id || curr === v) ? {
                                                                            ...curr,
                                                                            title: dim,
                                                                            options: { ...curr.options, Texture: '' }
                                                                        } : curr));
                                                                    } else {
                                                                        setVariants(variants.filter(curr => curr !== v && curr.id !== v.id));
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const last = (dimsVariants as any[])[(dimsVariants as any[]).length - 1];
                                                        setVariants([...variants, {
                                                            title: `${dim} / New Texture`,
                                                            price: last.price,
                                                            groupId,
                                                            options: { Dimension: dim, Texture: 'New Texture' }
                                                        }]);
                                                    }}
                                                    className="flex items-center gap-1.5 text-[10px] text-[#C5A572] font-body uppercase hover:underline pt-1"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Texture
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {variants.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-lg">
                                    <Grid3X3 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                    <p className="text-[12px] font-body text-gray-400">No dimensions added to the matrix.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newDim = "New Dimension";
                                            setVariants([{ title: newDim, price: 0, options: { Dimension: newDim, Texture: '' } }]);
                                        }}
                                        className="mt-4 bg-[#111] text-white px-6 py-2 rounded text-[10px] font-body uppercase tracking-widest hover:bg-[#C5A572] transition-all"
                                    >
                                        Create Pricing Grid
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                <Section
                    title="SEO & Visibility"
                    icon={Globe}
                    isOpen={activeSection === 'seo'}
                    onToggle={() => toggleSection('seo')}
                >
                    <div className="space-y-4">
                        <Field label="SEO Title"><input {...register('seoTitle')} className={inputClass} /></Field>
                        <Field label="SEO Description"><textarea {...register('seoDescription')} className={cn(inputClass, "h-20")} /></Field>
                    </div>
                </Section>
            </form>

            {/* Preview Column */}
            <div className="hidden lg:block lg:sticky lg:top-5">
                <ProductPreview data={{
                    name: watchedValues.name,
                    price: watchedValues.price,
                    status: watchedValues.status,
                    category: watchedValues.category,
                    collection: watchedValues.collection,
                    description: watchedValues.description || '',
                    images: media.map(m => ({ url: m.url, alt: m.alt })),
                    variants: variants
                }} />
            </div>

            {/* Mobile Preview Overlay */}
            <AnimatePresence>
                {showMobilePreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden flex flex-col pt-20"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="flex-1 bg-white rounded-t-[32px] shadow-2xl overflow-y-auto px-4 pb-12 relative"
                        >
                            <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur pb-4 pt-6 z-10 flex items-center justify-between border-b border-gray-100 mb-6">
                                <h2 className="text-sm font-heading font-medium text-gray-900 tracking-tight pl-2">Live Preview</h2>
                                <button
                                    onClick={() => setShowMobilePreview(false)}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <ProductPreview data={{
                                name: watchedValues.name || '',
                                price: watchedValues.price || 0,
                                status: watchedValues.status,
                                category: watchedValues.category,
                                collection: watchedValues.collection,
                                description: watchedValues.description || '',
                                images: media.map(m => ({ url: m.url, alt: m.alt })),
                                variants: variants
                            }} />
                            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3 text-emerald-900">
                                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-[11px] font-body">
                                    Edit Mode active. Changes are synced instantly with the storefront.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProductDetailClient({ product }: { product: any }) {
    const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 rounded-md hover:bg-gray-100 transition-colors"><ArrowLeft className="w-4 h-4 text-gray-400" /></Link>
                    <div><h1 className="text-xl font-heading text-gray-900">{product.name}</h1></div>
                </div>
                <div className="flex gap-1 bg-white border border-[#E5E5E5] rounded-lg p-1">
                    <button onClick={() => setActiveTab('view')} className={cn("px-5 py-2 rounded-md text-[11px] tracking-wider uppercase font-body transition-all", activeTab === 'view' ? 'bg-[#111] text-white' : 'text-gray-400')}>Overview</button>
                    <button onClick={() => setActiveTab('edit')} className={cn("px-5 py-2 rounded-md text-[11px] tracking-wider uppercase font-body transition-all", activeTab === 'edit' ? 'bg-[#111] text-white' : 'text-gray-400')}>Edit</button>
                </div>
            </div>
            {activeTab === 'view' ? <ProductViewTab product={product} /> : <ProductEditTab product={product} onSaved={() => setActiveTab('view')} />}
        </div>
    );
}
