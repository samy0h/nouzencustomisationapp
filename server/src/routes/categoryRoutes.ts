import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Get all categories
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  res.json({ status: 'success', data: { categories } });
}));

// Create a new category
router.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name?: string; slug?: string };

  if (!name?.trim() || !slug?.trim()) {
    throw new AppError('Name and slug are required', 400);
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
    },
  });

  res.status(201).json({ status: 'success', data: { category } });
}));

// Delete a category
router.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const force = req.query.force === 'true';

  // Check if any products use this category
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0 && !force) {
    throw new AppError(
      `Cannot delete category. ${productCount} product(s) are using it. Add ?force=true to delete anyway (products will be deleted).`,
      400
    );
  }

  // Delete all products in this category if force is true
  if (force && productCount > 0) {
    await prisma.product.deleteMany({
      where: { categoryId: id },
    });
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({ status: 'success', message: 'Category deleted successfully.' });
}));

export default router;
