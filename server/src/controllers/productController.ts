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

export const addAdminProductVariantColor = asyncHandler(async (req: Request, res: Response) => {
  const productId = String(req.params.id);
  const { color, colorHex, sizes } = req.body as { color?: string; colorHex?: string; sizes?: string[] };
  if (!color?.trim() || !/^#[0-9a-fA-F]{6}$/.test(colorHex || '') || !sizes?.length) {
    throw new AppError('Color name, six-digit hex code, and at least one size are required', 400);
  }
  const validatedColorHex = colorHex as string;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const existingColor = await prisma.productVariant.findFirst({
    where: { productId, color: { equals: color.trim(), mode: 'insensitive' } },
  });
  if (existingColor) throw new AppError('A color with this name already exists', 409);

  const variants = await prisma.$transaction(
    sizes.map(size => prisma.productVariant.upsert({
      where: { productId_color_size: { productId, color: color.trim(), size } },
      update: { colorHex: validatedColorHex },
      create: { productId, color: color.trim(), colorHex: validatedColorHex, size, stock: 0, available: true },
    }))
  );

  res.status(201).json({ status: 'success', data: { variants } });
});

export const deleteAdminProductImage = asyncHandler(async (req: Request, res: Response) => {
  const imageId = String(req.params.imageId);
  await prisma.productImage.delete({ where: { id: imageId } });
  res.json({ status: 'success', message: 'Product image deleted' });
});

export const deleteAdminProductColor = asyncHandler(async (req: Request, res: Response) => {
  const productId = String(req.params.id);
  const color = String(req.params.color);
  const variants = await prisma.productVariant.findMany({ where: { productId } });
  const matchingVariants = variants.filter(variant => variant.color.toLowerCase() === color.toLowerCase());

  if (!matchingVariants.length) throw new AppError('Color not found', 404);
  if (variants.length === matchingVariants.length) throw new AppError('At least one color must remain', 400);

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId, color: { equals: matchingVariants[0].color, mode: 'insensitive' } } }),
    prisma.productVariant.deleteMany({ where: { id: { in: matchingVariants.map(variant => variant.id) } } }),
  ]);

  res.json({ status: 'success', message: 'Color removed' });
});

export const createAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, sizeChartImage, price, type = 'OTHER', categoryId, supportsDoublePrint = false, variants = [], images = [] } = req.body as {
    name?: string; slug?: string; price?: number; type?: string; categoryId?: string;
    description?: string; sizeChartImage?: string;
    supportsDoublePrint?: boolean; variants?: Array<{ color: string; colorHex: string; sizes: string[] }>;
    images?: string[];
  };

  console.log('[CREATE PRODUCT] Received payload:', { name, slug, price, type, categoryId, supportsDoublePrint, variantsCount: variants.length, imagesCount: images.length });

  if (!name?.trim() || !slug?.trim() || typeof price !== 'number' || price < 0 || !categoryId || !variants.length) {
    throw new AppError('Name, slug, price, category, and at least one color are required', 400);
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(), slug: slug.trim().toLowerCase(), price, type: type as any,
        description: description?.trim() || null,
        sizeChartImage: sizeChartImage || null,
        categoryId, supportsDoublePrint,
        images: images || [],
        variants: { create: variants.flatMap(variant => variant.sizes.map(size => ({ color: variant.color, colorHex: variant.colorHex, size, stock: 0, available: true }))) },
      },
      include: { variants: true },
    });
    console.log('[CREATE PRODUCT] Product created successfully:', product.id);
    res.status(201).json({ status: 'success', data: { product } });
  } catch (error: any) {
    console.error('[CREATE PRODUCT] Database error:', error.message, error.code);
    if (error.code === 'P2002') {
      throw new AppError('A product with this slug already exists', 409);
    }
    if (error.code === 'P2003') {
      throw new AppError('Invalid category ID - category does not exist', 400);
    }
    throw error;
  }
});

export const updateAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, sizeChartImage, price, type, categoryId, supportsDoublePrint, images } = req.body as {
    name?: string; slug?: string; description?: string | null; sizeChartImage?: string | null; price?: number; type?: string;
    categoryId?: string; supportsDoublePrint?: boolean; images?: string[];
  };
  if (!name?.trim() || !slug?.trim() || typeof price !== 'number' || price < 0 || !categoryId) {
    throw new AppError('Name, slug, price, and category are required', 400);
  }

  const product = await prisma.product.update({
    where: { id: String(req.params.id) },
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      sizeChartImage: sizeChartImage || null,
      price,
      type: type as any,
      categoryId,
      supportsDoublePrint: Boolean(supportsDoublePrint),
      ...(images !== undefined && { images }),
    },
  });
  res.json({ status: 'success', data: { product } });
});

export const deleteAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.updateMany({ where: { id: String(req.params.id), active: true }, data: { active: false } });
  if (!product.count) throw new AppError('Product not found', 404);
  res.json({ status: 'success', message: 'Product archived' });
});
