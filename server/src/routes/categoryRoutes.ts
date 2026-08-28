import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all categories
router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  res.json({ status: 'success', data: { categories } });
}));

// Create a new category
router.post('/', asyncHandler(async (req, res) => {
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
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if any products use this category
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete category. ${productCount} product(s) are using it. Please reassign those products first.`,
      400
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({ status: 'success', message: 'Category deleted successfully' });
}));

export default router;
