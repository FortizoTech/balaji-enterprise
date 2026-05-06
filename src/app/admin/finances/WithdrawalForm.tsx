'use client';

import { useState } from 'react';
import { requestWithdrawal } from '@/app/actions/admin';
import { toast } from 'sonner';

export default function WithdrawalForm({ maxAmount }: { maxAmount: number }) {
    const [amount, setAmount] = useState('');
    const [destination, setDestination] = useState('');
    const [network, setNetwork] = useState('wave');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const reqAmount = parseFloat(amount);

        if (isNaN(reqAmount) || reqAmount <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        if (reqAmount > maxAmount) {
            toast.error('Amount exceeds available balance');
            return;
        }

        setIsLoading(true);
        try {
            const res = await requestWithdrawal(reqAmount, destination, network);
            if (res.success) {
                toast.success('Withdrawal request submitted successfully');
                setAmount('');
                setDestination('');
                setNetwork('wave');
            } else {
                toast.error(res.error || 'Failed to request withdrawal');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-heading text-gray-900 mb-4">Request Payout</h3>
            <div>
                <label className="block text-xs font-body tracking-wider uppercase text-gray-400 mb-2">Amount (GMD)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded text-sm font-body focus:outline-none focus:border-[#C5A572]"
                    placeholder="0.00"
                    step="0.01"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-body tracking-wider uppercase text-gray-400 mb-2">Network</label>
                <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded text-sm font-body focus:outline-none focus:border-[#C5A572] mb-4"
                >
                    <option value="wave">Wave</option>
                    <option value="afrimoney">Afrimoney</option>
                </select>
                <label className="block text-xs font-body tracking-wider uppercase text-gray-400 mb-2">Wallet Number</label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded text-sm font-body focus:outline-none focus:border-[#C5A572]"
                    placeholder="e.g. 7000000"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111] text-white py-2.5 rounded font-body text-xs tracking-widest uppercase hover:bg-[#C5A572] transition-colors disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : 'Submit Request'}
            </button>
        </form>
    );
}
