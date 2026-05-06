import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        // Verify Secret Hash from Modem Pay dashboard to prevent spoofed requests
        const secretHash = process.env.MODEM_PAY_WEBHOOK_SECRET;
        const signature = req.headers.get('verif-hash');

        if (secretHash && signature !== secretHash) {
            console.error('Modem Pay Webhook: Invalid signature received. Got:', signature);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        console.log('📦 Modem Pay Webhook received event:', payload.event, '| ref:', payload?.payload?.reference || payload?.payload?.id);

        // Handle payment success — mark order as PAID
        // Modem Pay may send charge.succeeded or payment.success depending on SDK version
        const isPaymentSuccess = payload.event === 'charge.succeeded' || payload.event === 'payment.success' || payload.event === 'charge.success';

        if (isPaymentSuccess) {
            const data = payload.payload || payload.data || payload;
            const orderId = data?.metadata?.order_id || data?.reference;
            const amount = data?.amount || 0;

            if (!orderId) {
                console.error('Modem Pay webhook: Missing order_id in metadata', JSON.stringify(data));
                return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 });
            }

            // Prevent duplicate processing via idempotency check
            const existingTransaction = await prisma.transaction.findFirst({
                where: { modemPayRef: data?.id || data?.reference }
            });

            if (existingTransaction) {
                console.log(`⚡ Duplicate webhook ignored for ref: ${data?.id}`);
                return NextResponse.json({ received: true, status: 'already_processed' });
            }

            const netMerchantAmount = amount * 0.90;
            const platformCommission = amount * 0.10;

            await prisma.transaction.create({
                data: {
                    orderId,
                    amount,
                    netMerchantAmount,
                    platformCommission,
                    status: 'SUCCESS',
                    modemPayRef: data?.id || data?.reference || null,
                },
            });

            const order = await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' },
                include: { items: { include: { product: true } } }
            });

            console.log(`✅ Order ${orderId} marked as PAID via Modem Pay webhook`);

            // Revalidate Next.js cache so dashboards show PAID without needing a reload
            revalidatePath('/dashboard');
            revalidatePath('/admin/orders');
            revalidatePath(`/admin/orders/${orderId}`);

            // Dispatch Payment Success Email
            const { sendPaymentSuccessEmail } = await import('@/lib/nodemailer');
            sendPaymentSuccessEmail(order).catch(console.error);

            // Handle refund — mark order as REFUNDED
        } else if (payload.event === 'refund.success' || payload.event === 'charge.refunded') {
            const data = payload.payload || payload.data || payload;
            const orderId = data?.metadata?.order_id || data?.reference;

            if (orderId) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'REFUNDED' },
                });
                revalidatePath('/dashboard');
                revalidatePath('/admin/orders');
                console.log(`🔄 Order ${orderId} marked as REFUNDED via Modem Pay webhook`);
            }
        } else {
            console.log(`ℹ️ Modem Pay webhook: Unhandled event type: ${payload.event}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error?.message || error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
