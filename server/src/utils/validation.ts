import { z } from 'zod';
import { WILAYAS } from './deliveryRates.js';

export const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  active: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);

const nameSchema = z.string().trim().min(2).max(120).regex(/^[\p{L}\s'-]+$/u, 'Name can only contain letters, spaces, hyphens and apostrophes');
const phoneSchema = z.string().trim().min(10).max(10).regex(/^0\d{9}$/, 'Phone must start with 0 and have exactly 10 digits');

export const createOrderSchema = z.object({
  customer: z.object({
    customerName: nameSchema,
    phone: phoneSchema,
    wilaya: z.enum(WILAYAS),
    deliveryMethod: z.enum(['A_DOMICILE', 'STOP_DESK']),
    baladia: z.string().trim().min(1).max(80),
    address: z.string().trim().max(240).optional(),
  }),
  items: z.array(z.object({
    clientItemId: z.string().trim().min(1).max(120).optional(),
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional().nullable(),
    quantity: z.coerce.number().int().min(1).max(99),
    color: z.string().trim().min(1).max(80),
    size: z.string().trim().min(1).max(20),
    fit: z.string().trim().max(40).optional().nullable(),
    customizationData: z.unknown().optional(),
    mockupFrontDataUrl: z.string().startsWith('data:').max(8_000_000).optional().nullable(),
    mockupBackDataUrl: z.string().startsWith('data:').max(8_000_000).optional().nullable(),
    designFrontDataUrl: z.string().startsWith('data:').max(8_000_000).optional().nullable(),
    designBackDataUrl: z.string().startsWith('data:').max(8_000_000).optional().nullable(),
  })).min(1).max(50),
});

export const getOrdersQuerySchema = z.object({
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  wilaya: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'total']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export const updateOrderSchema = z.object({
  customerName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  wilaya: z.string().trim().min(1).max(80).optional(),
  baladia: z.string().trim().min(1).max(80).optional(),
  address: z.string().trim().min(4).max(240).optional(),
  deliveryCost: z.coerce.number().min(0).optional(),
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).max(99),
  })).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  cancellationReason: z.string().trim().max(400).optional(),
});

export const deleteOrderItemSchema = z.object({
  itemId: z.string().uuid(),
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type ProductSlugParam = z.infer<typeof productSlugParamSchema>;
