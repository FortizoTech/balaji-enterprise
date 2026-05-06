import { getOrders } from '@/app/actions/admin';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle, Banknote, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSearch from '@/components/admin/AdminSearch';
import OrdersListClient from './OrdersListClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
    searchParams
}: {
    searchParams: { status?: string; search?: string; page?: string }
}) {
    const status = searchParams.status || 'ALL';
    const search = searchParams.search || '';
    const page = parseInt(searchParams.page || '1');

    const { orders, total } = await getOrders({ status, search, page });

    const statusFilters = [
        { label: 'All', value: 'ALL', icon: ShoppingBag },
        { label: 'Pending', value: 'PENDING', icon: Clock },
        { label: 'In Review', value: 'IN_REVIEW', icon: Clock },
        { label: 'Approved', value: 'APPROVED', icon: CheckCircle },
        { label: 'Paid', value: 'PAID', icon: Banknote },
        { label: 'Shipped', value: 'SHIPPED', icon: Truck },
        { label: 'Delivered', value: 'DELIVERED', icon: CheckCircle },
        { label: 'Refunded', value: 'REFUNDED', icon: Banknote },
        { label: 'Cancelled', value: 'CANCELLED', icon: ShoppingBag },
        { label: 'Settled', value: 'SETTLED', icon: Clock },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-sm font-body text-gray-500 mt-1">Manage customer orders and fulfillment</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {statusFilters.map((f) => (
                        <Link
                            key={f.value}
                            href={`/admin/orders?status=${f.value}${search ? `&search=${search}` : ''}`}
                            prefetch={false}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-body transition-all whitespace-nowrap",
                                status === f.value
                                    ? "bg-[#111] text-white border-[#111]"
                                    : "bg-white text-gray-500 border-[#E5E5E5] hover:border-gray-300"
                            )}
                        >
                            <f.icon className="w-3.5 h-3.5" />
                            {f.label}
                        </Link>
                    ))}
                </div>

                <AdminSearch
                    placeholder="Search customer, email or order ID..."
                    className="min-w-[300px]"
                />
            </div>

            <OrdersListClient initialOrders={orders} total={total} />
        </div>
    );
}
