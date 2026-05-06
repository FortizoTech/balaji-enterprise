import { getProductForInquiry } from '@/app/actions/inquiries';
import InquiryClient from './InquiryClient';
import { notFound } from 'next/navigation';

export default async function InquiryPage({
    searchParams
}: {
    searchParams: Promise<{ product: string; variant?: string }>
}) {
    const { product: productId, variant: variantId } = await searchParams;

    if (!productId) {
        notFound();
    }

    const product = await getProductForInquiry(productId);

    if (!product) {
        notFound();
    }

    return (
        <div className="pt-24 md:pt-32 min-h-screen">
            <InquiryClient product={product} initialVariantId={variantId} />
        </div>
    );
}
