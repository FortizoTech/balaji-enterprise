'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import OrderStatusDropdown from './OrderStatusDropdown';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';

export default function OrdersListClient({ initialOrders, total }: { initialOrders: any[], total: number }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

    const toggleSelection = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(p => [...p, id]);
        else setSelectedIds(p => p.filter(x => x !== id));
    };

    const toggleAll = (checked: boolean) => {
        if (checked) setSelectedIds(initialOrders.map(p => p.id));
        else setSelectedIds([]);
    };

    const executeBulkDelete = async (deleteAll: boolean) => {
        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'orders', ids: selectedIds, deleteAll })
            });
            if (res.ok) {
                toast.success(deleteAll ? 'All orders purged' : 'Selected orders deleted');
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
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onDeleteSelected={() => setIsDeleteDialogOpen(true)}
                onDeleteAll={() => setIsDeleteAllOpen(true)}
                entityName="Orders"
            />

            <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="hidden lg:table-header-group">
                        <tr className="bg-gray-50/50 border-b border-[#F0F0F0]">
                            <th className="px-6 py-4 text-left w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                                    checked={initialOrders.length > 0 && selectedIds.length === initialOrders.length}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium">Order ID</th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium">Customer</th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium">Items</th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium">Date</th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium">Total</th>
                            <th className="px-6 py-4 text-left text-[11px] font-body tracking-wider uppercase text-gray-400 font-medium text-right whitespace-nowrap">Status / Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-gray-200" />
                                        </div>
                                        <p className="text-sm font-body text-gray-400">No orders found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            initialOrders.map((order) => (
                                <tr key={order.id} className={cn("block lg:table-row group hover:bg-gray-50/50 transition-colors border-b border-[#F5F5F5] last:border-0 relative", selectedIds.includes(order.id) && "bg-amber-50/30")}>
                                    <td className="block lg:table-cell px-6 pt-5 lg:pt-4 pb-1 lg:pb-4 w-12 text-center lg:text-left relative z-20 top-4 lg:hidden">
                                        <div className="absolute top-4 right-4 lg:static">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572] scale-125 lg:scale-100"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={(e) => toggleSelection(order.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell px-6 w-12">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#C5A572] focus:ring-[#C5A572]"
                                            checked={selectedIds.includes(order.id)}
                                            onChange={(e) => toggleSelection(order.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="block lg:table-cell px-6 pt-5 lg:pt-4 pb-1 lg:pb-4">
                                        <div className="flex items-center justify-between lg:block">
                                            <Link href={`/admin/orders/${order.id}`} className="text-xs font-body font-medium text-gray-900 hover:text-[#C5A572] transition-colors uppercase">
                                                #{order.id.slice(-8)}
                                            </Link>
                                            <OrderStatusDropdown
                                                orderId={order.id}
                                                initialStatus={order.status}
                                                className="lg:hidden mt-1 pr-6"
                                            />
                                        </div>
                                    </td>
                                    <td className="block lg:table-cell px-6 py-2 lg:py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                                {order.user?.image ? (
                                                    <img src={order.user?.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-gray-400 font-body uppercase">
                                                        {(order.customerName || 'C').charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-body font-medium text-gray-700 leading-tight">{order.customerName || 'Guest'}</p>
                                                <p className="text-[10px] font-body text-gray-400 leading-tight mt-0.5">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="block lg:table-cell px-6 py-2 lg:py-4">
                                        <div className="flex items-baseline justify-between lg:block">
                                            <p className="text-[11px] font-body text-gray-500">
                                                {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                                            </p>
                                            <p className="text-[10px] font-body text-gray-300 truncate max-w-[150px] mt-0.5 hidden lg:block">
                                                {order.items?.map((item: any) => item.product?.name).join(', ')}
                                            </p>
                                            <p className="lg:hidden text-xs font-body font-semibold text-gray-900">D{order.total?.toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="block lg:table-cell px-6 py-2 lg:py-4">
                                        <p className="text-[11px] font-body text-gray-500 flex items-center justify-between lg:block">
                                            <span className="lg:hidden">Date:</span>
                                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4">
                                        <p className="text-xs font-body font-semibold text-gray-900">D{order.total?.toLocaleString()}</p>
                                    </td>
                                    <td className="block lg:table-cell px-6 pb-5 lg:pb-4 pt-1 lg:pt-4 text-right">
                                        <div className="flex items-center justify-end gap-3 relative z-10">
                                            <OrderStatusDropdown
                                                orderId={order.id}
                                                initialStatus={order.status}
                                                className="hidden lg:inline-block"
                                            />
                                            <Link href={`/admin/orders/${order.id}`} className="absolute inset-0 lg:static flex lg:items-center justify-end items-center px-6 lg:px-0 group" title="View Order Details">
                                                <div className="p-2 border border-transparent rounded-md group-hover:bg-white group-hover:border-[#E5E5E5] transition-all shadow-none group-hover:shadow-sm">
                                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C5A572] transition-colors" />
                                                </div>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
                entityName="Orders"
            />

            <BulkDeleteDialog
                isOpen={isDeleteAllOpen}
                onClose={() => setIsDeleteAllOpen(false)}
                onConfirm={() => executeBulkDelete(true)}
                count={0}
                entityName="Orders"
                isDeleteAll={true}
            />
        </div>
    );
}
