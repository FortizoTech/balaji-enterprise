'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productCreateSchema, type ProductCreateInput } from '@/lib/validations';
import { createProduct, saveProductVariants, uploadFile, addProductImage } from '@/app/actions/admin';
import {
    ChevronDown, ChevronUp, Save, Loader2, Package, Image as ImageIcon,
    DollarSign, FileText, Settings, Tag, Search, Plus, X, ArrowLeft, Grid3X3,
    Globe, Info, Wrench, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import MediaManager, { type MediaItem } from '@/components/admin/MediaManager';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ProductPreview from '@/components/admin/ProductPreview';
import { cn } from '@/lib/utils';
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

// ─── Main Component ───────────────────────────────────────────

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>('media');
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const toggleSection = (id: string) => {
        setActiveSection(activeSection === id ? null : id);
    };

    const [detailsList, setDetailsList] = useState<string[]>(['']);
    const [installList, setInstallList] = useState<string[]>(['']);
    const [techSpecsList, setTechSpecsList] = useState<{ key: string, value: string }[]>(
        [{ key: '', value: '' }]
    );

    // Media State
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map());

    // Variants State
    const [variants, setVariants] = useState<any[]>([]);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductCreateInput>({
        resolver: zodResolver(productCreateSchema),
        defaultValues: {
            status: 'DRAFT', unit: 'per sqm',
            category: 'floor', collection: '', techSpecs: {},
            price: 0, description: '',
        },
    });

    const watchedValues = watch();

    // ─── Persistence Logic ──────────────────────────────────────────
    const isLoaded = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const draft = localStorage.getItem('Balaji Enterprise_new_product_draft');
        if (draft && !isLoaded.current) {
            try {
                const parsed = JSON.parse(draft);
                if (parsed.formValues) {
                    Object.entries(parsed.formValues).forEach(([key, value]) => {
                        setValue(key as any, value);
                    });
                }
                if (parsed.detailsList) setDetailsList(parsed.detailsList);
                if (parsed.installList) setInstallList(parsed.installList);
                if (parsed.techSpecsList) setTechSpecsList(parsed.techSpecsList);
                if (parsed.variants) setVariants(parsed.variants);
                if (parsed.mediaItems) setMediaItems(parsed.mediaItems);
            } catch (e) {
                console.error("Draft recovery failed", e);
            }
        }
        isLoaded.current = true;
    }, [setValue]);

    useEffect(() => {
        if (!isLoaded.current) return;
        const draft = {
            formValues: watchedValues,
            detailsList,
            installList,
            techSpecsList,
            variants,
            mediaItems: mediaItems.map(m => ({ ...m, url: m.url.startsWith('blob:') ? '' : m.url }))
        };
        localStorage.setItem('Balaji Enterprise_new_product_draft', JSON.stringify(draft));
    }, [watchedValues, detailsList, installList, techSpecsList, variants, mediaItems]);

    const clearDraft = () => {
        localStorage.removeItem('Balaji Enterprise_new_product_draft');
    };

    // Media Handlers
    const handleUpload = useCallback(async (files: FileList) => {
        console.log('--- HANDLE UPLOAD START ---', files.length, 'files');
        const newMediaItems: MediaItem[] = [];
        const newPendingFiles = new Map(pendingFiles);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file) continue;

            const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const url = URL.createObjectURL(file);
            console.log('Created local preview:', id, url);

            newMediaItems.push({ id, url, alt: '' });
            newPendingFiles.set(id, file);
        }

        try {
            console.log('Updating state with', newMediaItems.length, 'new items');
            setMediaItems(prev => {
                const updated = [...prev, ...newMediaItems];
                console.log('New mediaItems state length:', updated.length);
                return updated;
            });
            setPendingFiles(newPendingFiles);
        } catch (error) {
            console.error('Preview error:', error);
            toast.error('Failed to create image previews');
        }
    }, [pendingFiles]);

    const onSubmit = async (data: ProductCreateInput) => {
        setSaving(true);
        try {
            data.details = detailsList.filter(Boolean);
            data.installation = installList.filter(Boolean);

            const specsMap: Record<string, string> = {};
            techSpecsList.forEach(s => {
                if (s.key.trim() && s.value.trim()) specsMap[s.key.trim()] = s.value.trim();
            });
            data.techSpecs = specsMap;

            if (variants.length > 0) {
                data.price = Math.min(...variants.filter(v => v.price > 0).map(v => v.price));
            }

            const result = await createProduct(data);
            if (result.success && result.product) {
                const productId = result.product.id;

                // 1. Upload & Create Media
                for (let i = 0; i < mediaItems.length; i++) {
                    const item = mediaItems[i];
                    const file = pendingFiles.get(item.id);

                    let imageUrl = item.url.startsWith('blob:') ? '' : item.url;

                    if (file) {
                        try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const uploadRes = await uploadFile(formData);
                            if (uploadRes.success && uploadRes.url) {
                                imageUrl = uploadRes.url;
                            } else {
                                throw new Error(uploadRes.error || 'File upload failed');
                            }
                        } catch (uploadError: any) {
                            console.error(`Failed to upload ${file.name || 'unknown'}:`, uploadError);
                            toast.error(`Failed to upload ${file.name || 'file'}: ${uploadError.message || 'Unknown error'}`);
                            continue; // Continue with other images
                        }
                    }

                    if (imageUrl) {
                        try {
                            const addRes = await addProductImage(productId, {
                                url: imageUrl,
                                alt: item.alt,
                                position: i
                            });
                            if (!addRes.success) throw new Error(addRes.error || 'DB update failed');
                        } catch (addError: any) {
                            console.error(`Failed to add image to product:`, addError);
                            toast.error(`Failed to save image link: ${addError.message}`);
                        }
                    }
                }

                // 2. Save Variants
                const validVariants = variants.filter(v => v.title && v.price > 0);
                if (validVariants.length > 0) {
                    await saveProductVariants(productId, validVariants);
                }

                toast.success('Product created successfully');
                clearDraft();
                router.push('/admin/products');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-heading text-gray-900 tracking-tight">
                            {watchedValues.name || 'New Product'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
                {/* Form Column */}
                <form
                    onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.error("Validation Errors:", errors);
                        toast.error("Please fill in all required fields (Name, Category, Collection, Description)");
                    })}
                    className="space-y-5"
                >
                    <div className="sticky top-5 z-20 flex items-center justify-between bg-white border border-[#E5E5E5] rounded-lg px-4 md:px-5 py-3 shadow-sm">
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-gray-300 font-body">Creation Mode</span>
                        </div>
                        <div className="flex items-center justify-end gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={() => setShowMobilePreview(!showMobilePreview)}
                                className="lg:hidden flex items-center gap-2 text-gray-600 px-4 py-2 text-[10px] tracking-wider uppercase font-body hover:bg-gray-50 transition-colors rounded-md border border-gray-200"
                            >
                                {showMobilePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                <span>Preview</span>
                            </button>
                            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#111] text-white px-5 md:px-6 py-2 text-[10px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md disabled:opacity-50">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span className="hidden md:inline">Create Product</span>
                                <span className="md:hidden">Create</span>
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
                            images={mediaItems}
                            onUpload={handleUpload}
                            onAddUrl={async (url) => {
                                const id = `url-${Date.now()}`;
                                setMediaItems(prev => [...prev, { id, url, alt: '' }]);
                            }}
                            onDelete={async (id) => setMediaItems(prev => prev.filter(m => m.id !== id))}
                            onUpdateAlt={async (id, alt) => setMediaItems(prev => prev.map(m => m.id === id ? { ...m, alt } : m))}
                            onReorder={setMediaItems}
                        />
                    </Section>

                    <Section
                        title="Core Details"
                        icon={Package}
                        isOpen={activeSection === 'core'}
                        onToggle={() => toggleSection('core')}
                    >
                        <div className="space-y-4">
                            <Field label="Product Name" error={errors.name?.message}><input {...register('name')} className={inputClass} placeholder="e.g. Saharan Gold Marble Tile" /></Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Status">
                                    <select {...register('status')} className={selectClass}>
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </Field>
                                <Field label="Unit" error={errors.unit?.message}><input {...register('unit')} className={inputClass} /></Field>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Collection" error={errors.collection?.message}><input {...register('collection')} className={inputClass} placeholder="e.g. Saharan Gold" /></Field>
                                <Field label="Category" error={errors.category?.message}>
                                    <select {...register('category')} className={selectClass}>
                                        <option value="floor">Floor Tiles</option>
                                        <option value="wall">Wall Tiles</option>
                                        <option value="bathroom">Bathroom & Light Tiles</option>
                                        <option value="spanish">Spanish Tiles</option>
                                    </select>
                                </Field>
                            </div>
                            <Field label="Base Price" error={errors.price?.message} hint={variants.length > 0 ? 'Auto-set from variants' : 'Initial price displayed'}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">D</span>
                                    <input type="number" {...register('price', { valueAsNumber: true })} className={cn(inputClass, "pl-7")} disabled={variants.length > 0} />
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
                        {errors.description && <p className="text-[10px] font-body text-red-500 mt-2">{errors.description.message}</p>}
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
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gray-400">Atelier Pricing Matrix</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newDim = "New Dimension";
                                        const groupId = Math.random().toString(36).substring(7);
                                        setVariants([...variants, {
                                            title: newDim,
                                            price: 0,
                                            groupId,
                                            options: { Dimension: newDim, Texture: '' }
                                        }]);
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
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center">
                                                        <Grid3X3 className="w-4 h-4 text-[#C5A572]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-body text-gray-400 uppercase tracking-wider leading-none mb-1">Dimension</p>
                                                        <input
                                                            className="text-[14px] font-heading text-gray-800 bg-transparent border-none p-0 focus:ring-0 w-full focus:bg-white"
                                                            value={dim}
                                                            onChange={(e) => {
                                                                const newDim = e.target.value;
                                                                setVariants(variants.map(v => {
                                                                    if (v.groupId === groupId || (v.options?.Dimension === dim && !v.groupId)) {
                                                                        const tex = v.options?.Texture || (v.title.includes(' / ') ? v.title.split(' / ')[1] : '');
                                                                        return {
                                                                            ...v,
                                                                            groupId: groupId,
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
                                                        <span className="text-[10px] font-body text-gray-400 uppercase">Textures Mode</span>
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
                                                                    setVariants(variants.map(v => (v === first) ? {
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
                                                                    const p = parseFloat(e.target.value) || 0;
                                                                    setVariants(variants.map(v => (v === (dimsVariants as any[])[0]) ? { ...v, price: p } : v));
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
                                                                        setVariants(variants.map(curr => (curr === v) ? {
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
                                                                            const p = parseFloat(e.target.value) || 0;
                                                                            setVariants(variants.map(curr => (curr === v) ? { ...curr, price: p } : curr));
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="pb-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if ((dimsVariants as any[]).length === 1) {
                                                                            setVariants(variants.map(curr => (curr === v) ? {
                                                                                ...curr,
                                                                                title: dim,
                                                                                options: { ...curr.options, Texture: '' }
                                                                            } : curr));
                                                                        } else {
                                                                            setVariants(variants.filter(curr => curr !== v));
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
                                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
                                        <Grid3X3 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                        <p className="text-[12px] font-body text-gray-400">No dimensions added yet.</p>
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
                            <Field label="SEO Title"><input {...register('seoTitle')} className={inputClass} placeholder="e.g. Saharan Gold Marble Tiles | Balaji Enterprise" /></Field>
                            <Field label="SEO Description"><textarea {...register('seoDescription')} className={cn(inputClass, "h-20")} placeholder="Meta description for search engines..." /></Field>
                        </div>
                    </Section>

                    <div className="flex justify-end pt-2 pb-8">
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-3 text-[11px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md disabled:opacity-50 shadow-lg shadow-black/10">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Create Product
                        </button>
                    </div>
                </form>

                {/* Preview Column */}
                <div className="hidden lg:block sticky top-5 space-y-4">
                    <ProductPreview data={{
                        name: watchedValues.name || '',
                        price: watchedValues.price || 0,
                        status: watchedValues.status,
                        category: watchedValues.category,
                        collection: watchedValues.collection,
                        description: watchedValues.description || '',
                        images: mediaItems.map(m => ({ url: m.url, alt: m.alt })),
                        variants: variants
                    }} />
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-900 leading-relaxed font-body">
                            You are in <strong>Creation Mode</strong>. Once saved, this product will be available for advanced catalog management.
                        </p>
                    </div>
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
                                    images: mediaItems.map(m => ({ url: m.url, alt: m.alt })),
                                    variants: variants
                                }} />
                                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
                                    <p className="text-[11px] text-amber-900 font-body">
                                        Creation Mode active. Changes are synced instantly.
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
