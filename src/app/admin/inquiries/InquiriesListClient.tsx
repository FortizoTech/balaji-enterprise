'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Eye, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AdminSearch from '@/components/admin/AdminSearch';
import { useSearchParams } from 'next/navigation';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';
import { toast } from 'sonner';

interface Inquiry {
    id: string;
    product: { name: string };
    customerName: string;
    customerEmail: string;
    status: string;
    isRead: boolean;
    createdAt: string;
    dimension: string;
    texture: string;
}

export default function InquiriesListClient({
    initialInquiries,
    total,
    pages,
}: {
    initialInquiries: Inquiry[];
    total: number;
    pages: number;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

    const toggleSelection = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(p => [...p, id]);
        else setSelectedIds(p => p.filter(x => x !== id));
    };

    const toggleAll = (checked: boolean) => {
        if (checked) setSelectedIds(initialInquiries.map(p => p.id));
        else setSelectedIds([]);
    };

    const executeBulkDelete = async (deleteAll: boolean) => {
        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'inquiries', ids: selectedIds, deleteAll })
            });
            if (res.ok) {
                toast.success(deleteAll ? 'All inquiries purged' : 'Selected inquiries deleted');
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error('Bulk deletion failed');
            }
        } catch {
            toast.error('An error occurred during deletion');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'RESPONDED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'CLOSED': return 'bg-gray-50 text-gray-400 border-gray-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <AdminSearch placeholder="Search inquiries..." className="flex-1 max-w-md" />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        const val = e.target.value;
                        setStatusFilter(val);
                        const params = new URLSearchParams(window.location.search);
                        if (val === 'ALL') params.delete('status');
                        else params.set('status', val);
                        router.push(`/admin/inquiries?${params.toString()}`);
                    }}
                    className="text-[11px] font-body tracking-wider uppercase text-gray-500 bg-transparent border border-gray-100 rounded-md px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESPONDED">Responded</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onDeleteSelected={() => setIsDeleteDialogOpen(true)}
                onDeleteAll={() => setIsDeleteAllOpen(true)}
                entityName="Inquiries"
            />

            <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-sm">
                <div className="hidden lg:grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA] items-center">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                        checked={initialInquiries.length > 0 && selectedIds.length === initialInquiries.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                    />
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Customer</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Product</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Options</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Date</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400">Status</span>
                    <span className="text-[10px] font-body tracking-wider uppercase text-gray-400 text-right">Actions</span>
                </div>

                {initialInquiries.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <MessageSquare className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                        <p className="text-sm text-gray-400 font-body">No inquiries found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F0F0F0]">
                        {initialInquiries.map((inquiry) => (
                            <div key={inquiry.id} className={cn("group hover:bg-[#FAFAFA] transition-colors relative", selectedIds.includes(inquiry.id) && "bg-amber-50/30")}>
                                <div className="flex flex-col lg:grid lg:grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr_80px] gap-4 p-4 lg:px-5 lg:py-4 items-center">
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-4 right-4 lg:static">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                                            checked={selectedIds.includes(inquiry.id)}
                                            onChange={(e) => toggleSelection(inquiry.id, e.target.checked)}
                                        />
                                    </div>

                                    {/* Customer */}
                                    <div className="space-y-1 relative w-full pr-8 lg:pr-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-heading text-gray-900">{inquiry.customerName}</p>
                                            {!inquiry.isRead && (
                                                <span className="flex-shrink-0 w-8 h-3 bg-[#C5A572] text-white text-[7px] font-bold flex items-center justify-center rounded-sm tracking-tighter animate-pulse">NEW</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-body text-gray-400">{inquiry.customerEmail}</p>
                                    </div>

                                    {/* Product */}
                                    <div className="flex items-center">
                                        <span className="text-[12px] font-body text-gray-600">{inquiry.product.name}</span>
                                    </div>

                                    {/* Options */}
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-body text-gray-400 uppercase tracking-tighter">{inquiry.dimension}</p>
                                        <p className="text-[10px] font-body text-gray-400 uppercase tracking-tighter">{inquiry.texture}</p>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center text-[12px] font-body text-gray-500">
                                        {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[9px] font-body font-medium uppercase tracking-widest border",
                                            getStatusColor(inquiry.status)
                                        )}>
                                            {inquiry.status}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center lg:justify-end gap-2">
                                        <Link
                                            href={`/admin/inquiries/${inquiry.id}`}
                                            className="p-2 text-gray-400 hover:text-[#C5A572] hover:bg-white rounded-md transition-all shadow-sm lg:shadow-none"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
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
                entityName="Inquiries"
            />

            <BulkDeleteDialog
                isOpen={isDeleteAllOpen}
                onClose={() => setIsDeleteAllOpen(false)}
                onConfirm={() => executeBulkDelete(true)}
                count={0}
                entityName="Inquiries"
                isDeleteAll={true}
            />
        </div>
    );
}
