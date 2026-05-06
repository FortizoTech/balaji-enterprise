import { getAdminDashboardStats } from '@/app/actions/admin';
import { Package, ShoppingCart, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats();

    const kpis = [
        {
            label: 'Total Revenue',
            value: `D${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders.toString(),
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Products',
            value: stats.totalProducts.toString(),
            icon: Package,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Customers',
            value: stats.totalCustomers.toString(),
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm font-body text-gray-400 mt-1">Overview of your Balaji Enterprise Atelier</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-[#111] text-white px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md"
                >
                    <Package className="w-3.5 h-3.5" />
                    Add Product
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-body tracking-wider uppercase text-gray-400">{kpi.label}</span>
                            <div className={`w-8 h-8 rounded-md ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-heading text-gray-900 tracking-tight">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg">
                <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
                    <h2 className="text-sm font-body font-medium text-gray-700">Recent Orders</h2>
                    <Link
                        href="/admin/orders"
                        className="text-[11px] font-body tracking-wider uppercase text-[#C5A572] hover:text-[#a88c5a] flex items-center gap-1"
                    >
                        View All <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                    {stats.recentOrders.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400 font-body">No orders yet</p>
                        </div>
                    ) : (
                        stats.recentOrders.map((order) => (
                            <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {order.user?.image ? (
                                        <img src={order.user.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                                            {order.customerName?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-body text-gray-700 truncate">{order.customerName || order.user?.name || 'Guest'}</p>
                                        <p className="text-[10px] font-body text-gray-400 truncate">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · #{order.id.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className="text-[13px] font-heading text-gray-900">
                                        D{order.total.toLocaleString()}
                                    </span>
                                    <span className={`text-[9px] font-body tracking-wider uppercase px-2 py-0.5 rounded-full border ${order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            order.status === 'DELIVERED' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    order.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        order.status === 'IN_REVIEW' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                            order.status === 'REFUNDED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
