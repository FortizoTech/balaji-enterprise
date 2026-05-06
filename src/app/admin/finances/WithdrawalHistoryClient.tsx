'use client';

import { useState } from 'react';
import { approveWithdrawal } from '@/app/actions/admin';
import { toast } from 'sonner';
import { Banknote, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function WithdrawalHistoryClient({ withdrawals }: { withdrawals: any[] }) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (id: string, amount: number) => {
        if (!confirm(`Are you sure you want to deploy D${amount.toLocaleString()} to this account via Modem Pay?`)) return;

        setProcessingId(id);
        const toastId = toast.loading('Initiating payout over Modem Pay network...');

        try {
            const res = await approveWithdrawal(id);
            if (res.success) {
                toast.success('Funds have been successfully transferred!', { id: toastId });
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to process transfer via provider.', { id: toastId });
            }
        } catch (error) {
            toast.error('An unexpected error occurred during the transfer.', { id: toastId });
        } finally {
            setProcessingId(null);
        }
    };

    if (withdrawals.length === 0) {
        return (
            <div className="px-6 py-12 text-center text-gray-400 font-body text-sm flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-gray-200" />
                No withdrawals requested yet.
            </div>
        );
    }

    return (
        <div className="divide-y divide-[#F5F5F5]">
            {withdrawals.map((w: any) => (
                <div key={w.id} className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-2 rounded-full relative">
                            <Banknote className="w-4 h-4 text-gray-500" />
                            {w.status === 'PENDING' && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-body font-medium text-gray-900">D{w.amount.toLocaleString()}</p>
                            <p className="text-xs font-body text-gray-400 mt-1">{w.destination}</p>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                        {w.status === 'PENDING' ? (
                            <button
                                onClick={() => handleApprove(w.id, w.amount)}
                                disabled={processingId === w.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] text-white rounded text-[9px] font-body tracking-wider uppercase hover:bg-[#C5A572] transition-colors disabled:opacity-50"
                            >
                                {processingId === w.id ? (
                                    <>
                                        <Clock className="w-3 h-3 animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-3 h-3 text-[#C5A572]" />
                                        Approve Transfer
                                    </>
                                )}
                            </button>
                        ) : (
                            <span className={cn(
                                "text-[9px] font-body tracking-widest uppercase px-2.5 py-1 rounded-full border",
                                w.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-gray-50 text-gray-400 border-gray-100"
                            )}>
                                {w.status}
                            </span>
                        )}
                        <p className="text-[10px] font-body text-gray-400">{format(new Date(w.requestedAt), 'MMM dd, yyyy')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
