'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { productCreateSchema, productUpdateSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

// ─── Helpers ───────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─── Dashboard Stats ──────────────────────────────────────────

export async function getAdminDashboardStats() {
    const [totalProducts, totalOrders, totalCustomers, revenueResult] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } }),
    ]);

    const recentOrders = await prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
            items: { include: { product: { select: { name: true } } } },
            user: { select: { name: true, email: true, image: true } },
        },
    });

    return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: revenueResult._sum.total || 0,
        recentOrders,
    };
}



// ─── Products ─────────────────────────────────────────────────

export async function getProducts(params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    const { search, category, status, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { collection: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (category && category !== 'all') where.category = category;
    if (status && status !== 'all') where.status = status;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                _count: { select: { orderItems: true } },
                productImages: { orderBy: { position: 'asc' } },
            },
        }),
        prisma.product.count({ where }),
    ]);

    return { products, total, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
    return prisma.product.findUnique({
        where: { id },
        include: {
            productImages: { orderBy: { position: 'asc' } },
            variants: true,
            options: { include: { values: true }, orderBy: { position: 'asc' } },
        },
    });
}

export async function createProduct(data: any) {
    const parsed = productCreateSchema.parse(data);

    const slug = parsed.slug || slugify(parsed.name);

    // Check for slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
        data: {
            ...parsed,
            name: parsed.name,
            price: parsed.price,
            unit: parsed.unit,
            description: parsed.description,
            collection: parsed.collection,
            category: parsed.category,
            dimensions: parsed.dimensions || "",
            material: parsed.material || "",
            finish: parsed.finish || "",
            techSpecs: parsed.techSpecs || {},
            slug: finalSlug,
        },
    });

    revalidatePath('/admin/products');
    revalidatePath('/collections');

    return { success: true, product };
}

export async function updateProduct(id: string, data: any) {
    try {
        const parsed = productUpdateSchema.parse(data);

        const product = await prisma.product.update({
            where: { id },
            data: parsed,
        });

        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/${id}`);
        revalidatePath('/collections');

        return { success: true, product };
    } catch (error: any) {
        console.error("Failed to update product:", error);
        if (error.code === 'P2024' || error.message.includes('Can\'t reach database')) {
            throw new Error("Database is currently busy or unreachable. Your changes will be synced shortly.");
        }
        throw error;
    }
}

export async function deleteProduct(id: string) {
    await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
    });

    revalidatePath('/admin/products');
    revalidatePath('/collections');

    return { success: true };
}

export async function updateProductStatus(id: string, status: string) {
    await prisma.product.update({
        where: { id },
        data: { status },
    });

    revalidatePath('/admin/products');
    revalidatePath('/collections');

    return { success: true };
}

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ─── Media Management ──────────────────────────────────────────

export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            console.error('UPLOAD ERROR: No file in FormData');
            return { success: false, error: 'No file provided' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // CREATE UNIQUE FILENAME
        const timestamp = Date.now();
        const originalName = (formData.get('filename') as string || file.name || 'unnamed').replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${timestamp}-${originalName}`;

        console.log('--- UPLOAD START ---');
        console.log('File Name:', file.name);
        console.log('File Size:', (file.size / 1024).toFixed(2), 'KB');
        console.log('Generated Filename:', filename);

        const uploadDir = join(process.cwd(), 'public', 'uploads');
        console.log('Target Dir:', uploadDir);

        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, filename);
        console.log('Target Path:', path);

        await writeFile(path, buffer);

        console.log('UPLOAD SUCCESS:', filename);
        return { success: true, url: `/uploads/${filename}` };
    } catch (error: any) {
        console.error('--- UPLOAD ERROR LOG ---');
        console.error('Error message:', error?.message);
        console.error('Stack:', error?.stack);
        return { success: false, error: 'Failed to write file to disk: ' + (error?.message || 'Unknown error') };
    }
}

export async function addProductImage(productId: string, data: { url: string; alt?: string; position?: number }) {
    console.log(`Adding image to product ${productId}:`, data.url);

    if (data.url.startsWith('blob:')) {
        console.error('CRITICAL ERROR: Attempted to save a local blob URL to database:', data.url);
        return { success: false, error: 'Cannot save temporary blob URLs. Upload failed.' };
    }

    const image = await prisma.productImage.create({
        data: {
            productId,
            url: data.url,
            alt: data.alt || '',
            position: data.position ?? 0,
        },
    });

    // Also update the legacy images array for compatibility
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { images: true } });
    if (product) {
        const currentImages = product.images || [];
        await prisma.product.update({
            where: { id: productId },
            data: { images: [...currentImages, data.url] }
        });
    }

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, image };
}

export async function deleteProductImage(imageId: string) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: 'Image not found' };

    await prisma.productImage.delete({ where: { id: imageId } });

    // Update legacy images array
    const product = await prisma.product.findUnique({ where: { id: image.productId }, select: { images: true } });
    if (product) {
        await prisma.product.update({
            where: { id: image.productId },
            data: { images: product.images.filter(url => url !== image.url) }
        });
    }

    revalidatePath(`/admin/products/${image.productId}`);
    return { success: true };
}

export async function updateMediaPositions(productId: string, imageIds: string[]) {
    // Perform bulk update of positions
    await Promise.all(
        imageIds.map((id, index) =>
            prisma.productImage.update({
                where: { id },
                data: { position: index }
            })
        )
    );

    // Update legacy images array to match new order
    const images = await prisma.productImage.findMany({
        where: { productId },
        orderBy: { position: 'asc' },
        select: { url: true }
    });

    await prisma.product.update({
        where: { id: productId },
        data: { images: images.map(img => img.url) }
    });

    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
}

export async function updateImageAltText(imageId: string, alt: string) {
    const image = await prisma.productImage.update({
        where: { id: imageId },
        data: { alt }
    });
    revalidatePath(`/admin/products/${image.productId}`);
    return { success: true };
}

// ─── Variants (Size/Price) ─────────────────────────────────────

export async function saveProductVariants(
    productId: string,
    variants: { id?: string; title: string; price: number; sku?: string; options?: any }[]
) {
    // Delete variants not in the incoming list
    const existingVariants = await prisma.variant.findMany({ where: { productId }, select: { id: true } });
    const incomingIds = variants.filter(v => v.id).map(v => v.id!);
    const toDelete = existingVariants.filter(v => !incomingIds.includes(v.id)).map(v => v.id);

    if (toDelete.length > 0) {
        await prisma.variant.deleteMany({ where: { id: { in: toDelete } } });
    }

    // Upsert each variant
    for (const variant of variants) {
        if (variant.id) {
            await prisma.variant.update({
                where: { id: variant.id },
                data: {
                    title: variant.title,
                    price: variant.price,
                    sku: variant.sku || null,
                    options: variant.options || {},
                },
            });
        } else {
            await prisma.variant.create({
                data: {
                    productId,
                    title: variant.title,
                    price: variant.price,
                    sku: variant.sku || null,
                    options: variant.options || {},
                },
            });
        }
    }

    // Update the base product price to the lowest variant price
    if (variants.length > 0) {
        const minPrice = Math.min(...variants.map(v => v.price));
        if (!isNaN(minPrice) && isFinite(minPrice)) {
            await prisma.product.update({
                where: { id: productId },
                data: { price: minPrice },
            });
        }
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/admin/products');
    revalidatePath('/collections');

    return { success: true };
}

export async function deleteVariant(variantId: string) {
    const variant = await prisma.variant.delete({ where: { id: variantId } });
    revalidatePath(`/admin/products/${variant.productId}`);
    return { success: true };
}

// ─── Orders ───────────────────────────────────────────────────

export async function getOrders(params?: { status?: string; search?: string; page?: number }) {
    const { status, search, page = 1 } = params || {};
    const where: any = {};

    if (status && status !== 'ALL') {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } },
        ];
    }

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
        include: {
            user: { select: { name: true, image: true, email: true } },
            items: { include: { product: { select: { name: true } } } },
        },
    });

    const total = await prisma.order.count({ where });

    return { orders, total };
}

export async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, image: true, email: true, firstName: true, lastName: true } },
            items: { include: { product: true } },
        },
    });
}

export async function updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
        where: { id },
        data: { status },
    });

    if (status === 'SHIPPED' || status === 'DELIVERED') {
        const { sendOrderStatusUpdateEmail } = await import('@/lib/nodemailer');
        sendOrderStatusUpdateEmail(order, status).catch(console.error);
    }

    if (status === 'APPROVED') {
        const { sendOrderApprovalEmail } = await import('@/lib/nodemailer');
        sendOrderApprovalEmail(order).catch(console.error);
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    return { success: true, order };
}

export async function updateOrderTotal(id: string, total: number) {
    const order = await prisma.order.update({
        where: { id },
        data: { total },
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    return { success: true, order };
}

// ─── Payouts ──────────────────────────────────────────────────

export async function getPayouts() {
    return await prisma.payout.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createPayout(data: { amount: number; reference: string; bankDetails: string; fees: number; orderIds: string[] }) {
    const netAmount = data.amount - data.fees;

    const payout = await prisma.payout.create({
        data: {
            ...data,
            netAmount,
            status: 'COMPLETED'
        }
    });

    // Update orders to SETTLED status
    if (data.orderIds.length > 0) {
        await prisma.order.updateMany({
            where: { id: { in: data.orderIds } },
            data: { status: 'SETTLED' }
        });
    }

    revalidatePath('/admin/settings/payouts');
    revalidatePath('/admin/orders');
    return { success: true, payout };
}


export async function getFinancialSummary() {
    const orders = await prisma.order.findMany({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
        select: { total: true }
    });

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

    const settledOrders = await prisma.order.findMany({
        where: { status: 'SETTLED' },
        select: { total: true }
    });

    const totalSettled = settledOrders.reduce((acc, o) => acc + o.total, 0);
    const availableBalance = totalRevenue;

    return {
        totalRevenue,
        totalSettled,
        availableBalance
    };
}

// ─── Finances & Withdrawals ─────────────────────────────────────

export async function processOrderRefund(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: 'Order not found' };

    const daysSince = (new Date().getTime() - order.createdAt.getTime()) / (1000 * 3600 * 24);
    if (daysSince > 7) {
        return { success: false, error: 'Order is older than 7 days. Refund policy expired.' };
    }

    try {
        const modemPayMode = process.env.NEXT_PUBLIC_MODEM_PAY_MODE || 'test';
        const secretKey = modemPayMode === 'live'
            ? process.env.MODEM_PAY_LIVE_SECRET_KEY
            : process.env.MODEM_PAY_TEST_SECRET_KEY;

        const transaction = await prisma.transaction.findFirst({
            where: { orderId: order.id, status: 'SUCCESS' }
        });

        if (transaction && transaction.modemPayRef) {
            const response = await fetch('https://api.modempay.com/v1/transactions/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${secretKey}`
                },
                body: JSON.stringify({
                    reference: transaction.modemPayRef,
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'API rejection' }));
                console.error("Modem Pay API refund rejected:", errData);
                return { success: false, error: `Gateway rejected refund: ${errData.message}` };
            }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'REFUNDED' }
        });

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Refund Processing failed.' };
    }
}

// ─── Customers ────────────────────────────────────────────────

export async function getCustomers(params?: { search?: string; page?: number }) {
    const { search, page = 1 } = params || {};
    const where: any = { role: 'USER' };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    const customers = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
        include: {
            _count: { select: { orders: true } },
            orders: { select: { total: true }, take: 100 },
        },
    });

    const total = await prisma.user.count({ where });

    return { customers, total };
}

// ─── Inquiries ────────────────────────────────────────────────

export async function getInquiries(params?: { status?: string; search?: string; page?: number }) {
    const { status, search, page = 1 } = params || {};
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    if (search) {
        where.OR = [
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { product: { name: { contains: search, mode: 'insensitive' } } },
            { message: { contains: search, mode: 'insensitive' } },
        ];
    }

    const inquiries = await prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * 20,
        take: 20,
        include: { product: { select: { name: true } } }
    });

    const total = await prisma.inquiry.count({ where });
    return { inquiries, total };
}

export async function getInquiryById(id: string) {
    const inquiry = await prisma.inquiry.findUnique({
        where: { id },
        include: { product: true }
    });

    if (inquiry && !inquiry.isRead) {
        await prisma.inquiry.update({
            where: { id },
            data: { isRead: true }
        });
    }

    return inquiry;
}

export async function updateInquiryStatus(id: string, status: string) {
    const inquiry = await prisma.inquiry.update({
        where: { id },
        data: { status }
    });
    revalidatePath('/admin/inquiries');
    return { success: true, inquiry };
}

export async function respondToInquiry(id: string, message: string) {
    try {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id },
            include: { product: true }
        });

        if (!inquiry) return { success: false, error: 'Inquiry not found' };

        // Send email
        const { sendInquiryResponseEmail } = await import('@/lib/nodemailer');
        await sendInquiryResponseEmail(inquiry, message);

        // Update status
        await prisma.inquiry.update({
            where: { id },
            data: { status: 'RESPONDED' }
        });

        revalidatePath('/admin/inquiries');
        revalidatePath(`/admin/inquiries/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to respond to inquiry:', error);
        return { success: false, error: 'Failed to send response' };
    }
}
