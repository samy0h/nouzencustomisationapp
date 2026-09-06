import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  deleteOrderItem,
  getDashboardStats,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAdmin, getOrders);
router.get('/admin/dashboard/stats', requireAdmin, getDashboardStats);
router.get('/:id', requireAdmin, getOrderById);
router.patch('/:id', requireAdmin, updateOrder);
router.patch('/:id/status', requireAdmin, updateOrderStatus);
router.delete('/:id', requireAdmin, deleteOrder);
router.delete('/:id/items/:itemId', requireAdmin, deleteOrderItem);

export default router;
