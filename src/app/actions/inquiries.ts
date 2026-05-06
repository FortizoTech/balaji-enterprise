'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createInquiry(data: {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    message?: string;
    dimension: string;
    texture: string;
}) {
    try {
        const inquiry = await prisma.inquiry.create({
            data: {
                productId: data.productId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                message: data.message,
                status: 'PENDING',
                dimension: data.dimension,
                texture: data.texture,
            }
        });

        const { sendAdminInquiryAlert } = await import('@/lib/nodemailer');
        sendAdminInquiryAlert(inquiry).catch(console.error);

        revalidatePath('/admin/inquiries');
        return { success: true, inquiryId: inquiry.id };
    } catch (error) {
        console.error('Error creating inquiry:', error);
        return { success: false, error: 'Failed to submit inquiry' };
    }
}

export async function getProductForInquiry(id: string) {
    return await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
    });
}
