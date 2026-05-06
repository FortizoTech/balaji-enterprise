'use client';

import { Package, Ruler, Layers, Tag } from 'lucide-react';

interface ProductPreviewProps {
    data: {
        name: string;
        price: number;
        status: string;
        category: string;
        collection: string;
        description: string;
        images: { url: string; alt: string }[];
        variants: { title: string; price: number }[];
    }
}

export default function ProductPreview({ data }: ProductPreviewProps) {
    const mainImage = data.images?.[0]?.url;
    const hasVariants = data.variants?.length > 0;
    const minPrice = hasVariants ? Math.min(...data.variants.map(v => v.price)) : data.price;

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-[#111] px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Live Storefront Preview</span>
                <div className="w-8" />
            </div>

            <div className="p-0">
                <div className="aspect-[4/3] bg-gray-100 relative group overflow-hidden">
                    {mainImage ? (
                        <img src={mainImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-200" />
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-body tracking-wider uppercase shadow-sm">
                            {data.status}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-body tracking-[0.2em] uppercase text-[#C5A572]">
                            <Tag className="w-3 h-3" />
                            <span>{data.collection || 'Collection'}</span>
                            <span className="text-gray-300">/</span>
                            <span>{data.category}</span>
                        </div>
                        <h3 className="text-xl font-heading text-gray-900 leading-tight">
                            {data.name || 'Product Name'}
                        </h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-heading text-gray-900">D{minPrice.toLocaleString()}</span>
                        <span className="text-[11px] font-body text-gray-400 uppercase tracking-wider">Per SQM</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                        <p className="text-[12px] font-body text-gray-500 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: data.description || 'Description will appear here...' }} />

                        {hasVariants && (
                            <div className="flex flex-wrap gap-2">
                                {data.variants.map((v, i) => (
                                    <div key={i} className="px-3 py-1.5 rounded border border-gray-100 bg-gray-50 text-[10px] font-body text-gray-600 flex items-center gap-2">
                                        <Ruler className="w-3 h-3 text-gray-400" />
                                        {v.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button disabled className="w-full bg-[#111] text-white py-3 text-[11px] tracking-[0.2em] uppercase font-body mt-4 opacity-50 cursor-not-allowed">
                        Add to Atelier
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                <p className="text-[9px] font-body text-gray-400 uppercase tracking-widest">
                    Interactive simulation mode active
                </p>
            </div>
        </div>
    );
}
