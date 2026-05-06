'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: {
    userId?: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerRegion: string;
    total: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
        dimension?: string;
        texture?: string;
    }[];
}) {
    try {
        const order = await prisma.order.create({
            data: {
                userId: data.userId,
                customerEmail: data.customerEmail,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                customerAddress: data.customerAddress,
                customerCity: data.customerCity,
                customerRegion: data.customerRegion,
                total: data.total,
                status: 'PENDING',
                type: 'ORDER_REQUEST',
                items: {
                    create: data.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        dimension: item.dimension,
                        texture: item.texture,
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
            },
        });

        console.log(`Order created successfully: ${order.id}`);

        // Dispatch HTML Receipt asynchronously
        const { sendReceiptEmail, sendAdminOrderAlert } = await import('@/lib/nodemailer');
        sendReceiptEmail(order).catch(console.error);
        sendAdminOrderAlert(order).catch(console.error);

        revalidatePath('/dashboard');
        revalidatePath('/admin/orders');

        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error('Error creating order:', error?.message || error);
        return { success: false, error: error?.message || 'Failed to create order' };
    }
}

export async function getOrderById(id: string) {
    try {
        return await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

export async function cancelOrder(orderId: string, reason?: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
            include: {
                items: { include: { product: true } },
                user: { select: { email: true, name: true } }
            }
        });

        console.log(`Order ${orderId} cancelled successfully${reason ? `: ${reason}` : ''}`);

        // Notify Client & Admin
        const { sendOrderCancelledEmail } = await import('@/lib/nodemailer');
        await sendOrderCancelledEmail(order, reason);

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, error: 'Failed to cancel requisition' };
    }
}

export async function requestRefund(orderId: string, reason: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'REFUND_REQUESTED',
                // We could also store the reason in a new field if schema allowed, 
                // but for now we'll just log and email it.
            },
            include: { items: { include: { product: true } } }
        });

        console.log(`Refund requested for order ${orderId}: ${reason}`);

        // Notify Admin
        const { sendRefundRequestAdminEmail } = await import('@/lib/nodemailer');
        await sendRefundRequestAdminEmail(order, reason);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error requesting refund:', error);
        return { success: false, error: 'Failed to request refund' };
    }
}

export async function getLatestOrderDetails(userId: string) {
    try {
        const lastOrder = await prisma.order.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                customerAddress: true,
                customerCity: true,
                customerRegion: true,
            }
        });

        return lastOrder;
    } catch (error) {
        console.error('Error fetching latest order details:', error);
        return null;
    }
}
