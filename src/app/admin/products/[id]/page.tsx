import { getProductById } from '@/app/actions/admin';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) return notFound();

    return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />;
}
