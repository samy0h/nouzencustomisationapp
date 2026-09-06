import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Get all product types
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const productTypes = await prisma.productType.findMany({
    orderBy: { name: 'asc' },
  });
  res.json({ status: 'success', data: { productTypes } });
}));

// Create a new product type
router.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name?: string; slug?: string };

  if (!name?.trim() || !slug?.trim()) {
    throw new AppError('Name and slug are required', 400);
  }

  const productType = await prisma.productType.create({
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
    },
  });

  res.status(201).json({ status: 'success', data: { productType } });
}));

// Delete a product type
router.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const force = req.query.force === 'true';

  // Check if any products use this type
  const productCount = await prisma.product.count({
    where: { typeId: id },
  });

  if (productCount > 0 && !force) {
    throw new AppError(
      `Cannot delete product type. ${productCount} product(s) are using it. Add ?force=true to delete anyway (products will be deleted).`,
      400
    );
  }

  // Delete all products with this type if force is true
  if (force && productCount > 0) {
    await prisma.product.deleteMany({
      where: { typeId: id },
    });
  }

  await prisma.productType.delete({
    where: { id },
  });

  res.json({ status: 'success', message: 'Product type deleted successfully.' });
}));

export default router;
