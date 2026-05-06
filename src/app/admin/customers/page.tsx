import { getCustomers } from '@/app/actions/admin';
import Link from 'next/link';
import { Users, Search, Mail, ShoppingBag, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AdminSearch from '@/components/admin/AdminSearch';
import CustomersListClient from './CustomersListClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
    searchParams
}: {
    searchParams: { search?: string; page?: string }
}) {
    const search = searchParams.search || '';
    const page = parseInt(searchParams.page || '1');

    const { customers, total } = await getCustomers({ search, page });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Customers</h1>
                    <p className="text-sm font-body text-gray-500 mt-1">View and manage your customer database</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <AdminSearch
                    placeholder="Search by name or email..."
                    className="flex-1 w-full"
                />
                <div className="text-[11px] md:text-xs font-body text-gray-400 whitespace-nowrap">
                    Total: <span className="text-gray-900 font-medium">{total}</span> Customers
                </div>
            </div>

            <CustomersListClient initialCustomers={customers} total={total} />
        </div>
    );
}
