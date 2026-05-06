import { getFinancialSummary } from '@/app/actions/admin';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { Wallet, CheckCircle, ArrowRight } from 'lucide-react';

export default async function FinancesPage() {
    const summary = await getFinancialSummary();

    const transactions = await prisma.transaction.findMany({
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' }
    });

    const totalEarnings = transactions.reduce((acc, t) => acc + t.netMerchantAmount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Revenue & Settlements</h1>
                <p className="text-sm font-body text-gray-500 mt-1">Track your store's passive earnings and automated Modem Pay settlements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-body tracking-wider uppercase text-gray-500">Total Client Earnings</h3>
                        <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-heading text-gray-900 tracking-tight">D{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <p className="text-[10px] font-body text-gray-400 mt-2">Reflects your 90% revenue share</p>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ArrowRight className="w-24 h-24" />
                    </div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <h3 className="text-xs font-body tracking-wider uppercase text-gray-500">Settlement Status</h3>
                        <CheckCircle className="w-5 h-5 text-[#C5A572]" />
                    </div>
                    <div className="mt-4 relative z-10">
                        <span className="text-xl font-heading text-gray-900 tracking-tight">Automated</span>
                        <p className="text-[10px] font-body text-gray-400 mt-2">Funds are actively swept to your destination wallet</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0F0F0] bg-gray-50/50">
                    <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-900">Recent Transactions Overview</h3>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                    {transactions.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-body text-gray-500">No successful transactions yet.</p>
                        </div>
                    ) : (
                        transactions.map((t) => (
                            <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="text-sm font-body text-gray-900 font-medium">Order #{t.orderId?.slice(-6) || 'Unknown'}</p>
                                    <p className="text-xs font-body text-gray-500">{format(new Date(t.createdAt), 'MMM d, yyyy h:mm a')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-heading font-medium text-emerald-600">+D{t.netMerchantAmount.toLocaleString()}</p>
                                    <p className="text-[10px] font-body uppercase tracking-wider text-gray-400 mt-0.5">Your Split</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
