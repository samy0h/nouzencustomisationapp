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

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/admin/dashboard/stats', getDashboardStats);
router.get('/:id', getOrderById);
router.patch('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
router.delete('/:id/items/:itemId', deleteOrderItem);

export default router;
