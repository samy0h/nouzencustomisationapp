import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all product types
router.get('/', asyncHandler(async (req, res) => {
  const productTypes = await prisma.productType.findMany({
    orderBy: { name: 'asc' },
  });
  res.json({ status: 'success', data: { productTypes } });
}));

// Create a new product type
router.post('/', asyncHandler(async (req, res) => {
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
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if any products use this type
  const productCount = await prisma.product.count({
    where: { typeId: id },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete product type. ${productCount} product(s) are using it. Please reassign those products first.`,
      400
    );
  }

  await prisma.productType.delete({
    where: { id },
  });

  res.json({ status: 'success', message: 'Product type deleted successfully' });
}));

export default router;
