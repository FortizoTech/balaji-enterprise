import { getProductById } from '@/app/actions/admin';
import { notFound } from 'next/navigation';
import EditProductClient from '../EditProductClient';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) return notFound();

    return <EditProductClient product={JSON.parse(JSON.stringify(product))} />;
}
