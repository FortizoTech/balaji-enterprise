'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Eye, Package, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteProduct, updateProductStatus } from '@/app/actions/admin';
import { toast } from 'sonner';

import AdminSearch from '@/components/admin/AdminSearch';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';

interface Product {
    id: string;
    name: string;
    slug: string | null;
    status: string;
    price: number;
    category: string;
    collection: string;
    images: string[];
    updatedAt: string;
    _count: { orderItems: number };
}

export default function ProductsListClient({
    initialProducts,
    total,
    pages,
}: {
    initialProducts: Product[];
    total: number;
    pages: number;
}) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState('all');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

    const toggleSelection = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(p => [...p, id]);
        else setSelectedIds(p => p.filter(x => x !== id));
    };

    const toggleAll = (checked: boolean) => {
        if (checked) setSelectedIds(initialProducts.map(p => p.id));
        else setSelectedIds([]);
    };

    const executeBulkDelete = async (deleteAll: boolean) => {
        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'products', ids: selectedIds, deleteAll })
            });
            if (res.ok) {
                toast.success(deleteAll ? 'All products purged' : 'Selected products deleted');
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error('Bulk deletion failed');
            }
        } catch {
            toast.error('An error occurred during deletion');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Archive "${name}"? It will no longer appear in the storefront.`)) return;
        await deleteProduct(id);
        toast.success(`Archived ${name}`);
        router.refresh();
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateProductStatus(id, newStatus);
            toast.success('Status updated successfully');
            router.refresh();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600';
            case 'DRAFT': return 'bg-amber-50 text-amber-700';
            case 'ARCHIVED': return 'bg-gray-100 text-gray-400';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-3 flex items-center gap-3">
                <AdminSearch
                    placeholder="Search products..."
                    className="flex-1"
                />
                <div className="h-5 w-px bg-gray-100" />
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        const val = e.target.value;
                        setStatusFilter(val);
                        const params = new URLSearchParams(window.location.search);
                        if (val !== 'all') params.set('status', val);
                        else params.delete('status');
                        params.delete('page'); // Reset to page 1
                        router.push(`/admin/products?${params.toString()}`);
                    }}
                    className="text-[11px] font-body tracking-wider uppercase text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer pr-4"
                >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onDeleteSelected={() => setIsDeleteDialogOpen(true)}
                onDeleteAll={() => setIsDeleteAllOpen(true)}
                entityName="Products"
            />

            {/* Products Table */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
                {/* Table Header - Desktop Only */}
                <div className="hidden lg:grid grid-cols-[40px_3fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA] items-center">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                        checked={initialProducts.length > 0 && selectedIds.length === initialProducts.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                    />
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Product</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Status</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Category</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Price</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400 text-right">Actions</span>
                </div>

                {/* Table Rows */}
                {initialProducts.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm text-gray-400 font-body mb-4">No products found</p>
                        <Link
                            href="/admin/products/new"
                            className="text-[11px] tracking-wider uppercase text-[#C5A572] hover:text-[#a88c5a] font-body"
                        >
                            Create your first product →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F0F0F0]">
                        {initialProducts.map((product) => (
                            <div key={product.id} className={cn("group hover:bg-[#FAFAFA] transition-colors relative", selectedIds.includes(product.id) && "bg-amber-50/30")}>
                                <div className="flex flex-col lg:grid lg:grid-cols-[40px_3fr_1fr_1fr_1fr_80px] gap-4 p-4 lg:px-5 lg:py-4 items-center">
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-4 right-4 lg:static">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                                            checked={selectedIds.includes(product.id)}
                                            onChange={(e) => toggleSelection(product.id, e.target.checked)}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex items-center gap-4 w-full pr-8 lg:pr-0">
                                        <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden relative">
                                            <img
                                                src={product.images[0] || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="text-sm font-heading text-gray-900 truncate block hover:text-[#C5A572] transition-colors"
                                            >
                                                {product.name}
                                            </Link>
                                            <p className="text-[11px] font-body text-gray-400 truncate uppercase tracking-wider">{product.collection}</p>
                                        </div>
                                    </div>

                                    {/* Status - Interactive Dropdown */}
                                    <div className="flex items-center justify-between lg:block relative">
                                        <span className="lg:hidden text-[10px] text-gray-400 font-body uppercase tracking-wider">Status</span>
                                        <div className="relative inline-block">
                                            <select
                                                value={product.status}
                                                onChange={(e) => handleStatusChange(product.id, e.target.value)}
                                                className={cn(
                                                    "appearance-none px-3 py-1 rounded-sm text-[10px] font-body font-medium uppercase tracking-wider cursor-pointer border-none outline-none pr-6",
                                                    getStatusColor(product.status),
                                                    "hover:opacity-80 transition-opacity"
                                                )}
                                            >
                                                <option value="DRAFT">DRAFT</option>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="ARCHIVED">ARCHIVED</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 opacity-50">
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category - Mobile Layout Adjustment */}
                                    <div className="flex items-center justify-between lg:block">
                                        <span className="lg:hidden text-[10px] text-gray-400 font-body uppercase tracking-wider">Category</span>
                                        <span className="text-[12px] font-body text-gray-600 truncate block">{product.category}</span>
                                    </div>

                                    {/* Price - Mobile Layout Adjustment */}
                                    <div className="flex items-center justify-between lg:block">
                                        <span className="lg:hidden text-[10px] text-gray-400 font-body uppercase tracking-wider">Price</span>
                                        <span className="text-[12px] font-body text-gray-900 font-medium">D{product.price.toLocaleString()}</span>
                                    </div>



                                    {/* Actions - Mobile Layout Adjustment */}
                                    <div className="flex items-center lg:justify-end gap-2 pt-4 lg:pt-0 border-t lg:border-none border-gray-50 mt-2 lg:mt-0">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-md border border-transparent hover:border-gray-100 transition-all shadow-sm lg:shadow-none"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-md border border-transparent hover:border-gray-100 transition-all shadow-sm lg:shadow-none"
                                            title="Edit Product"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all shadow-sm lg:shadow-none"
                                            title="Archive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BulkDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => executeBulkDelete(false)}
                count={selectedIds.length}
                entityName="Products"
            />

            <BulkDeleteDialog
                isOpen={isDeleteAllOpen}
                onClose={() => setIsDeleteAllOpen(false)}
                onConfirm={() => executeBulkDelete(true)}
                count={0}
                entityName="Products"
                isDeleteAll={true}
            />
        </div>
    );
}
