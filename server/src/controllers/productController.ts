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
      productImages: { include: { variants: true } },
      printAreas: true,
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

export const getAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: String(req.params.id) },
    include: {
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      productImages: { include: { variants: true }, orderBy: { sortOrder: 'asc' } },
      printAreas: true,
    },
  });

  if (!product) throw new AppError('Product not found', 404);
  res.json({ status: 'success', data: { product } });
});

export const saveAdminProductDesign = asyncHandler(async (req: Request, res: Response) => {
  const { images = [], printAreas = [] } = req.body as {
    images?: Array<{ color: string; side: 'FRONT' | 'BACK'; url: string; fileName?: string; variantIds?: string[] }>;
    printAreas?: Array<{ side: 'FRONT' | 'BACK'; x: number; y: number; width: number; height: number; enabled: boolean }>;
  };
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
  if (!product) throw new AppError('Product not found', 404);

  await prisma.$transaction(async transaction => {
    for (const image of images) {
      const savedImage = await transaction.productImage.upsert({
        where: { productId_color_side: { productId: product.id, color: image.color, side: image.side } },
        update: { url: image.url, fileName: image.fileName },
        create: { productId: product.id, color: image.color, side: image.side, url: image.url, fileName: image.fileName },
      });
      await transaction.variantImage.deleteMany({ where: { imageId: savedImage.id } });
      if (image.variantIds?.length) {
        await transaction.variantImage.createMany({
          data: image.variantIds.map(variantId => ({ variantId, imageId: savedImage.id })),
          skipDuplicates: true,
        });
      }
    }
    for (const area of printAreas) {
      await transaction.printArea.upsert({
        where: { productId_side: { productId: product.id, side: area.side } },
        update: area,
        create: { productId: product.id, ...area },
      });
    }
  });

  res.json({ status: 'success', message: 'Product design settings saved' });
});
