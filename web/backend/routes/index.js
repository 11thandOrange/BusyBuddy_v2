import express from 'express';
const router = express.Router();
import productRoutes from './products/index.js';
import bundleRoutes from './bundles/index.js';

router.use('/products', productRoutes); 
router.use('/bundles', bundleRoutes);

export default router;