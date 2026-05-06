'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { updateOrderStatus } from '@/app/actions/admin';
import { toast } from 'sonner';

export default function OrderStatusDropdown({
    orderId,
    initialStatus,
    className
}: {
    orderId: string;
    initialStatus: string;
    className?: string;
}) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'PAID': return 'bg-blue-50 text-blue-600';
            case 'SHIPPED': return 'bg-amber-50 text-amber-600';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600';
            case 'SETTLED': return 'bg-purple-50 text-purple-600';
            case 'REFUNDED': return 'bg-red-50 text-red-600';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'APPROVED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'IN_REVIEW': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'PAYMENT_PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        setStatus(newStatus);

        try {
            const res = await updateOrderStatus(orderId, newStatus);
            if (res.success) {
                toast.success('Status updated successfully');
                router.refresh();
            } else {
                toast.error((res as any)?.error || 'Failed to update status');
                setStatus(initialStatus); // Revert
            }
        } catch (error) {
            toast.error('Failed to update status');
            setStatus(initialStatus); // Revert
        } finally {
            setIsUpdating(false);
        }
    };

    const isFinalized = initialStatus === 'REFUNDED' || initialStatus === 'CANCELLED';

    return (
        <div className={cn("relative inline-block", className)}>
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating || isFinalized}
                className={cn(
                    "appearance-none px-3 py-1 rounded-sm text-[10px] font-body font-medium uppercase tracking-wider border-none outline-none",
                    getStatusColor(status),
                    isFinalized ? "opacity-80 cursor-default" : "pr-6 hover:opacity-80 cursor-pointer disabled:opacity-50",
                    "transition-opacity"
                )}
            >
                <option value="PENDING">PENDING</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                <option value="PAID">PAID</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="SETTLED">SETTLED</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="CANCELLED">CANCELLED</option>
            </select>
            {!isFinalized && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 opacity-50">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
