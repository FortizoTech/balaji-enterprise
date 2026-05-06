'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productUpdateSchema, type ProductUpdateInput } from '@/lib/validations';
import { updateProduct } from '@/app/actions/admin';
import {
    ChevronDown,
    ChevronUp,
    Save,
    Loader2,
    Package,
    Image as ImageIcon,
    DollarSign,
    FileText,
    Settings,
    Search,
    Plus,
    X,
    ArrowLeft,
    Check,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import MediaManager, { type MediaItem } from '@/components/admin/MediaManager';
import { uploadFile, addProductImage, deleteProductImage, updateImageAltText, updateMediaPositions } from '@/app/actions/admin';

// ─── Collapsible Section ──────────────────────────────────────

function Section({ title, icon: Icon, children, isOpen, onToggle }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-5 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-[13px] md:text-sm font-body font-medium text-gray-700">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
            </button>
            {isOpen && (
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

export default function EditProductClient({ product }: { product: any }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>('overview');
    const [detailsList, setDetailsList] = useState<string[]>(product.details?.length ? product.details : ['']);
    const [installList, setInstallList] = useState<string[]>(product.installation?.length ? product.installation : ['']);

    // Media State
    const [media, setMedia] = useState<MediaItem[]>(() => {
        if (product.productImages?.length > 0) {
            return product.productImages.map((img: any) => ({
                id: img.id, url: img.url, alt: img.alt || ''
            }));
        }
        return (product.images || []).map((url: string, index: number) => ({
            id: `legacy-${index}`, url, alt: ''
        }));
    });

    const toggleSection = (id: string) => {
        setActiveSection(activeSection === id ? null : id);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ProductUpdateInput>({
        resolver: zodResolver(productUpdateSchema),
        defaultValues: {
            name: product.name,
            status: product.status,
            price: product.price,
            unit: product.unit,
            collection: product.collection,
            category: product.category,
            description: product.description,
            dimensions: product.dimensions,
            material: product.material,
            finish: product.finish,
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
        },
    });

    const watchedName = watch('name');
    const watchedStatus = watch('status');

    const onSubmit = async (data: ProductUpdateInput) => {
        setSaving(true);
        setSaved(false);
        try {
            data.details = detailsList.filter(Boolean);
            data.installation = installList.filter(Boolean);
            data.images = media.map(m => m.url);
            const result = await updateProduct(product.id, data);
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save product changes");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = useCallback(async (files: FileList) => {
        if (!files || files.length === 0) return;

        console.log('--- ADMIN EDIT UPLOAD ---', files.length, 'files');
        setSaving(true);

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

                console.log('Uploading file', i + 1, '/', tempItems.length, ':', file.name);
                const uploadRes = await uploadFile(formData);

                if (uploadRes.success && uploadRes.url) {
                    console.log('Upload success, adding to DB');
                    const addRes = await addProductImage(product.id, {
                        url: uploadRes.url,
                        position: basePosition + i
                    });

                    if (addRes.success && addRes.image) {
                        // Transition from temp to permanent
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
                console.error(`Upload failed for file ${file?.name || 'unknown'}:`, error);
                // Mark item as failed in UI
                setMedia(prev => prev.map(m => m.id === tempItem.id ? {
                    ...m,
                    isUploading: false,
                    error: error.message || 'Upload failed'
                } : m));
                toast.error(`Failed to upload ${file?.name || 'file'}: ${error.message || 'Unknown error'}`);
            }
        }

        setSaving(false);
        router.refresh();
    }, [media.length, product.id, router]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-heading text-gray-900 tracking-tight">{watchedName || product.name}</h1>
                        <p className="text-[11px] font-body text-gray-400 tracking-wider uppercase mt-0.5">Editing · {watchedStatus}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-[11px] font-body text-emerald-600">
                            <Check className="w-3.5 h-3.5" /> Saved
                        </span>
                    )}
                    <Link href="/admin/products" className="px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-body text-gray-500 hover:text-gray-700 border border-[#E5E5E5] rounded-md transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 text-[11px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md disabled:opacity-50">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Section 1: Overview */}
            <Section
                title="Product Overview"
                icon={Package}
                isOpen={activeSection === 'overview'}
                onToggle={() => toggleSection('overview')}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Product Name" error={errors.name?.message}>
                            <input {...register('name')} className={inputClass} />
                        </Field>
                        <Field label="Status">
                            <select {...register('status')} className={selectClass}>
                                <option value="DRAFT">Draft</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Collection"><input {...register('collection')} className={inputClass} /></Field>
                        <Field label="Category">
                            <select {...register('category')} className={selectClass}>
                                <option value="floor">Floor Tiles</option>
                                <option value="wall">Wall Tiles</option>
                                <option value="bathroom">Bathroom & Light Tiles</option>
                                <option value="spanish">Spanish Tiles</option>
                            </select>
                        </Field>
                    </div>
                </div>
            </Section>

            {/* Section 2: Media */}
            <Section
                title="Media Gallery"
                icon={ImageIcon}
                isOpen={activeSection === 'media'}
                onToggle={() => toggleSection('media')}
            >
                <MediaManager
                    images={media}
                    onUpload={handleUpload}
                    onAddUrl={async (url) => {
                        setSaving(true);
                        const addRes = await addProductImage(product.id, { url, position: media.length });
                        if (addRes.success && addRes.image) {
                            setMedia(prev => [...prev, {
                                id: addRes.image!.id,
                                url: addRes.image!.url,
                                alt: addRes.image!.alt
                            }]);
                        } else {
                            toast.error(`Failed to add image: ${addRes.error || 'Server error'}`);
                        }
                        setSaving(false);
                    }}
                    onDelete={async (id) => {
                        setSaving(true);
                        await deleteProductImage(id);
                        setMedia(m => m.filter(x => x.id !== id));
                        setSaving(false);
                    }}
                    onUpdateAlt={async (id, alt) => {
                        await updateImageAltText(id, alt);
                        setMedia(m => m.map(x => x.id === id ? { ...x, alt } : x));
                    }}
                    onReorder={async (newOrder) => {
                        setMedia(newOrder);
                        await updateMediaPositions(product.id, newOrder.map(x => x.id));
                    }}
                />
            </Section>

            {/* Section 3: Pricing */}
            <Section
                title="Pricing & Inventory"
                icon={DollarSign}
                isOpen={activeSection === 'pricing'}
                onToggle={() => toggleSection('pricing')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Price" error={errors.price?.message}><input {...register('price')} type="number" step="0.01" className={inputClass} /></Field>
                    <Field label="Unit"><input {...register('unit')} className={inputClass} /></Field>
                </div>
            </Section>

            {/* Section 4: Description */}
            <Section
                title="Description & Details"
                icon={FileText}
                isOpen={activeSection === 'description'}
                onToggle={() => toggleSection('description')}
            >
                <div className="space-y-4">
                    <Field label="Description" error={errors.description?.message}>
                        <textarea {...register('description')} rows={4} className={`${inputClass} resize-none`} />
                    </Field>
                    <Field label="Key Details">
                        <div className="space-y-2">
                            {detailsList.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input value={d} onChange={(e) => { const n = [...detailsList]; n[i] = e.target.value; setDetailsList(n); }} className={inputClass} />
                                    {detailsList.length > 1 && <button type="button" onClick={() => setDetailsList(detailsList.filter((_, j) => j !== i))} className="p-1.5 rounded hover:bg-red-50"><X className="w-3.5 h-3.5 text-gray-300" /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => setDetailsList([...detailsList, ''])} className="text-[11px] tracking-wider uppercase text-[#C5A572] font-body flex items-center gap-1"><Plus className="w-3 h-3" /> Add Detail</button>
                        </div>
                    </Field>
                    <Field label="Installation Steps">
                        <div className="space-y-2">
                            {installList.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] font-body text-gray-300 w-5 text-center">{i + 1}.</span>
                                    <input value={s} onChange={(e) => { const n = [...installList]; n[i] = e.target.value; setInstallList(n); }} className={inputClass} />
                                    {installList.length > 1 && <button type="button" onClick={() => setInstallList(installList.filter((_, j) => j !== i))} className="p-1.5 rounded hover:bg-red-50"><X className="w-3.5 h-3.5 text-gray-300" /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => setInstallList([...installList, ''])} className="text-[11px] tracking-wider uppercase text-[#C5A572] font-body flex items-center gap-1"><Plus className="w-3 h-3" /> Add Step</button>
                        </div>
                    </Field>
                </div>
            </Section>

            {/* Section 5: Specifications */}
            <Section
                title="Specifications"
                icon={Settings}
                isOpen={activeSection === 'specs'}
                onToggle={() => toggleSection('specs')}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Material"><input {...register('material')} className={inputClass} /></Field>
                    <Field label="Finish"><input {...register('finish')} className={inputClass} /></Field>
                    <Field label="Dimensions"><input {...register('dimensions')} className={inputClass} /></Field>
                </div>
            </Section>

            {/* Section 6: SEO */}
            <Section
                title="SEO & Metadata"
                icon={Search}
                isOpen={activeSection === 'seo'}
                onToggle={() => toggleSection('seo')}
            >
                <div className="space-y-4">
                    <Field label="SEO Title" hint={`${(watch('seoTitle') || '').length}/60 characters`}>
                        <input {...register('seoTitle')} className={inputClass} maxLength={60} />
                    </Field>
                    <Field label="SEO Description" hint={`${(watch('seoDescription') || '').length}/160 characters`}>
                        <textarea {...register('seoDescription')} rows={2} className={`${inputClass} resize-none`} maxLength={160} />
                    </Field>
                </div>
            </Section>

            <div className="flex justify-end pt-2 pb-8">
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-3 text-[11px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md disabled:opacity-50">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
