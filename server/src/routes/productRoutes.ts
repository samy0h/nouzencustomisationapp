import { Router } from 'express';
import { getProducts, getProductBySlug, getAdminProduct, saveAdminProductDesign, addAdminProductVariantColor, deleteAdminProductImage, deleteAdminProductColor, createAdminProduct, deleteAdminProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/:id', getAdminProduct);
router.post('/admin', createAdminProduct);
router.delete('/admin/:id', deleteAdminProduct);
router.put('/admin/:id/design', saveAdminProductDesign);
router.post('/admin/:id/variants/color', addAdminProductVariantColor);
router.delete('/admin/:id/variants/color/:color', deleteAdminProductColor);
router.delete('/admin/images/:imageId', deleteAdminProductImage);
router.get('/:slug', getProductBySlug);

export default router;
