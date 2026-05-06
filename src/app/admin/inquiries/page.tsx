import { getInquiries } from '@/app/actions/admin';
import InquiriesListClient from './InquiriesListClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function InquiriesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const status = searchParams.status as string || 'ALL';
    const search = searchParams.search as string || '';
    const page = parseInt(searchParams.page as string || '1');

    const { inquiries, total } = await getInquiries({ status, search, page });
    const pages = Math.ceil(total / 20);

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-heading text-gray-900 tracking-tight uppercase">Inquiries</h1>
                    <p className="text-sm font-body text-gray-400 tracking-wide uppercase">Manage product-specific customer requests</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E5E5] rounded-lg">
                    <Loader2 className="w-8 h-8 text-[#C5A572] animate-spin mb-4" />
                    <p className="text-xs font-body text-gray-400 uppercase tracking-widest">Loading Inquiries...</p>
                </div>
            }>
                <InquiriesListClient
                    initialInquiries={inquiries as any}
                    total={total}
                    pages={pages}
                />
            </Suspense>
        </div>
    );
}
