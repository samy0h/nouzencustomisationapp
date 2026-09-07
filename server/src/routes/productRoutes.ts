import { Router } from 'express';
import { getProducts, getProductBySlug, getAdminProduct, saveAdminProductDesign, addAdminProductVariantColor, deleteAdminProductImage, deleteAdminProductColor, createAdminProduct, updateAdminProduct, deleteAdminProduct, updateAdminProductVariantSizes } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/:id', requireAdmin, getAdminProduct);
router.post('/admin', requireAdmin, createAdminProduct);
router.patch('/admin/:id', requireAdmin, updateAdminProduct);
router.delete('/admin/:id', requireAdmin, deleteAdminProduct);
router.put('/admin/:id/design', requireAdmin, saveAdminProductDesign);
router.post('/admin/:id/variants/color', requireAdmin, addAdminProductVariantColor);
router.patch('/admin/:id/variants/color/:color/sizes', requireAdmin, updateAdminProductVariantSizes);
router.delete('/admin/:id/variants/color/:color', requireAdmin, deleteAdminProductColor);
router.delete('/admin/images/:imageId', requireAdmin, deleteAdminProductImage);
router.get('/:slug', getProductBySlug);

export default router;
