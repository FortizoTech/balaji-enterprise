import { getOrderById } from '@/app/actions/orders';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

export default async function PaymentPage({
    searchParams
}: {
    searchParams: Promise<{ orderId?: string }>
}) {
    const params = await searchParams;
    const orderId = params.orderId;

    if (!orderId) {
        return redirect('/dashboard');
    }

    const order = await getOrderById(orderId);

    if (!order) {
        notFound();
    }

    // We are relying entirely on the CUID unguessable nature of the orderId for security on this page.
    // Ensure no accidental redirects from session mismatch.
    const session = await getServerSession(authOptions) as any;

    // Check if the order is ready for payment
    if (order.status !== 'APPROVED' && order.status !== 'PAYMENT_PENDING') {
        return (
            <div className="min-h-screen pt-32 pb-24 content-padding text-center">
                <h1 className="text-2xl font-heading mb-4 text-gray-900">Payment Unavailable</h1>
                <p className="text-gray-500 font-body mb-8">This order cannot be paid for in its current status: {order.status}</p>
                <a href="/dashboard" className="px-6 py-3 bg-[#111] text-white font-body text-xs uppercase tracking-widest hover:bg-[#C5A572] transition-colors">Return to Dashboard</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 content-padding">
            <PaymentClient order={order} />
        </div>
    );
}
