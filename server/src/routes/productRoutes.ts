import { Router } from 'express';
import { getProducts, getProductBySlug, getAdminProduct, saveAdminProductDesign, addAdminProductVariantColor, deleteAdminProductImage, deleteAdminProductColor, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/:id', requireAdmin, getAdminProduct);
router.post('/admin', requireAdmin, createAdminProduct);
router.patch('/admin/:id', requireAdmin, updateAdminProduct);
router.delete('/admin/:id', requireAdmin, deleteAdminProduct);
router.put('/admin/:id/design', requireAdmin, saveAdminProductDesign);
router.post('/admin/:id/variants/color', requireAdmin, addAdminProductVariantColor);
router.delete('/admin/:id/variants/color/:color', requireAdmin, deleteAdminProductColor);
router.delete('/admin/images/:imageId', requireAdmin, deleteAdminProductImage);
router.get('/:slug', getProductBySlug);

export default router;
