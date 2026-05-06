'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Mail, ShoppingBag, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';
import { cn } from '@/lib/utils';

export default function CustomersListClient({ initialCustomers, total }: { initialCustomers: any[], total: number }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

    const toggleSelection = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(p => [...p, id]);
        else setSelectedIds(p => p.filter(x => x !== id));
    };

    const toggleAll = (checked: boolean) => {
        if (checked) setSelectedIds(initialCustomers.map((p: any) => p.id));
        else setSelectedIds([]);
    };

    const executeBulkDelete = async (deleteAll: boolean) => {
        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'customers', ids: selectedIds, deleteAll })
            });
            if (res.ok) {
                toast.success(deleteAll ? 'All customers purged' : 'Selected customers deleted');
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error('Bulk deletion failed');
            }
        } catch {
            toast.error('An error occurred during deletion');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
                <input
                    type="checkbox"
                    id="selectAllCustomers"
                    className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                    checked={initialCustomers.length > 0 && selectedIds.length === initialCustomers.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                />
                <label htmlFor="selectAllCustomers" className="text-sm font-body text-gray-600 cursor-pointer">
                    Select All on Page
                </label>
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onDeleteSelected={() => setIsDeleteDialogOpen(true)}
                onDeleteAll={() => setIsDeleteAllOpen(true)}
                entityName="Customers"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialCustomers.length === 0 ? (
                    <div className="col-span-full bg-white border border-[#E5E5E5] rounded-lg p-20 flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-100" />
                        <p className="text-sm font-body text-gray-400 text-center">No customers found</p>
                    </div>
                ) : (
                    initialCustomers.map((customer) => {
                        const totalOrders = customer._count?.orders || 0;
                        const totalSpent = customer.orders?.reduce((acc: number, o: any) => acc + o.total, 0) || 0;

                        return (
                            <div key={customer.id} className={cn("relative bg-white border border-[#E5E5E5] rounded-lg group hover:border-[#C5A572] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md", selectedIds.includes(customer.id) && "border-[#C5A572] bg-amber-50/20")}>
                                <div className="absolute top-4 right-4 z-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572] scale-125 lg:scale-100"
                                        checked={selectedIds.includes(customer.id)}
                                        onChange={(e) => toggleSelection(customer.id, e.target.checked)}
                                    />
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between pr-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                {customer.image ? (
                                                    <img src={customer.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-400 font-body uppercase">
                                                        {(customer.name || customer.email || 'C').charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-body font-semibold text-gray-900 leading-tight truncate max-w-[150px]">
                                                    {customer.name || 'Anonymous User'}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-[10px] font-body text-gray-400 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate max-w-[120px]">{customer.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <span className="inline-block text-[9px] font-body tracking-wider uppercase bg-gray-50 text-gray-400 px-2.5 py-1 rounded border border-gray-100">
                                        {customer.role}
                                    </span>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#F5F5F5]">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-body tracking-wider uppercase text-gray-400">Total Orders</p>
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                                                <p className="text-sm font-body font-bold text-gray-900">{totalOrders}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-body tracking-wider uppercase text-gray-400">Lifetime Value</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3.5 h-3.5 text-[#C5A572] font-body font-bold text-[10px]">D</div>
                                                <p className="text-sm font-body font-bold text-gray-900">D{totalSpent.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1 text-[10px] font-body text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            Joined {format(new Date(customer.createdAt), 'MMM yyyy')}
                                        </div>
                                        <button className="text-[10px] font-body tracking-widest uppercase text-gray-400 hover:text-[#C5A572] flex items-center gap-1.5 transition-colors">
                                            History
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {total > 20 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button className="px-4 py-2 border border-[#E5E5E5] rounded text-xs font-body text-gray-400 hover:bg-gray-50 transition-colors">Previous</button>
                    <button className="px-4 py-2 border border-[#E5E5E5] rounded text-xs font-body text-gray-400 hover:bg-gray-50 transition-colors">Next</button>
                </div>
            )}

            <BulkDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => executeBulkDelete(false)}
                count={selectedIds.length}
                entityName="Customers"
            />

            <BulkDeleteDialog
                isOpen={isDeleteAllOpen}
                onClose={() => setIsDeleteAllOpen(false)}
                onConfirm={() => executeBulkDelete(true)}
                count={0}
                entityName="Customers"
                isDeleteAll={true}
            />
        </div>
    );
}
