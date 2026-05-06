import { getOrder } from '@/app/actions/admin';
import { notFound } from 'next/navigation';
import OrderDetailsClient from './OrderDetailsClient';

export default async function OrderDetailsPage({
    params
}: {
    params: { id: string }
}) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto">
            <OrderDetailsClient order={order} />
        </div>
    );
}
