import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import type { Request, Response } from 'express';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

// Get all coupons (admin only)
router.get('/', requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: 'success', data: { coupons } });
}));

// Create coupon (admin only)
router.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { code, discountPercent } = req.body;

  if (!code || !discountPercent) {
    res.status(400).json({ status: 'error', message: 'Code and discount percent are required' });
    return;
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountPercent: parseInt(discountPercent)
    }
  });

  res.status(201).json({ status: 'success', data: { coupon } });
}));

// Validate coupon (public)
router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ status: 'error', message: 'Code is required' });
    return;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase(), active: true }
  });

  if (!coupon) {
    res.status(404).json({ status: 'error', message: 'Invalid or expired coupon code' });
    return;
  }

  res.json({ status: 'success', data: { coupon } });
}));

// Delete coupon (admin only)
router.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Coupon deleted' });
}));

export default router;
