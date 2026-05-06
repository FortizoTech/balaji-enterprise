import { z } from 'zod';

// ─── Product Schemas ───────────────────────────────────────────

export const productCreateSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
    price: z.coerce.number().min(0, "Price must be positive"),
    unit: z.string().min(1, "Unit is required (e.g. per sqm)"),
    collection: z.string().min(1, "Collection is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    details: z.array(z.string()).default([]),
    dimensions: z.string().default(""),
    material: z.string().default(""),
    finish: z.string().default(""),
    images: z.array(z.string()).default([]),
    techSpecs: z.any().default({}),
    installation: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// ─── Order Schemas ─────────────────────────────────────────────

export const orderStatusSchema = z.object({
    status: z.enum(["PENDING", "IN_REVIEW", "APPROVED", "PAYMENT_PENDING", "PAID", "CANCELLED"]),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
