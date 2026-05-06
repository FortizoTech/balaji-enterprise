import { getProducts } from '@/app/actions/admin';
import Link from 'next/link';
import { Package, Plus, Search } from 'lucide-react';
import ProductsListClient from './ProductsListClient';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const { products, total, pages } = await getProducts({
        search: params.search,
        category: params.category,
        status: params.status,
        page: params.page ? parseInt(params.page) : 1,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm font-body text-gray-400 mt-1">{total} product{total !== 1 ? 's' : ''} in your catalogue</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-[#111] text-white px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase font-body hover:bg-[#C5A572] transition-colors duration-300 rounded-md"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Product
                </Link>
            </div>

            {/* Products list (client component for interactivity) */}
            <ProductsListClient
                initialProducts={JSON.parse(JSON.stringify(products))}
                total={total}
                pages={pages}
            />
        </div>
    );
}
