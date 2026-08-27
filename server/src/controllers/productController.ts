import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { getProductsQuerySchema, productSlugParamSchema } from '../utils/validation.js';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getProductsQuerySchema.parse(req.query);

  const where: any = {};

  if (validatedQuery.category) {
    where.category = { slug: validatedQuery.category };
  }

  if (validatedQuery.featured) {
    where.featured = validatedQuery.featured === 'true';
  }

  if (validatedQuery.active !== undefined) {
    where.active = validatedQuery.active === 'true';
  } else {
    // By default, only return active products
    where.active = true;
  }

  const limit = validatedQuery.limit ? parseInt(validatedQuery.limit) : 50;
  const offset = validatedQuery.offset ? parseInt(validatedQuery.offset) : 0;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { available: true },
          select: {
            id: true,
            color: true,
            colorHex: true,
            size: true,
            priceOverride: true,
            stock: true,
            available: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + products.length < total,
      },
    },
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const validatedParams = productSlugParamSchema.parse(req.params);

  const product = await prisma.product.findUnique({
    where: {
      slug: validatedParams.slug,
      active: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        where: { available: true },
        select: {
          id: true,
          color: true,
          colorHex: true,
          size: true,
          priceOverride: true,
          stock: true,
          available: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      product,
    },
  });
});
