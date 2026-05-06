import { getInquiryById } from '@/app/actions/admin';
import InquiryDetailsClient from './InquiryDetailsClient';
import { notFound } from 'next/navigation';

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const inquiry = await getInquiryById(id);

    if (!inquiry) {
        notFound();
    }

    return <InquiryDetailsClient inquiry={inquiry} />;
}
