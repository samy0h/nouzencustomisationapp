import { z } from 'zod';

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

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type ProductSlugParam = z.infer<typeof productSlugParamSchema>;
