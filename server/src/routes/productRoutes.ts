import { Router } from 'express';
import { getProducts, getProductBySlug, getAdminProduct, saveAdminProductDesign } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/:id', getAdminProduct);
router.put('/admin/:id/design', saveAdminProductDesign);
router.get('/:slug', getProductBySlug);

export default router;
