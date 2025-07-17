import express from 'express';
const router = express.Router();
import productRoutes from './products/index.js';
import bundleRoutes from './bundles/index.js';
import frontStoreRoutes from './frontStore/index.js';
import announcementBarRoutes from './announcementBars/index.js';

router.use('/products', productRoutes); 
router.use('/bundles', bundleRoutes);
router.use('/frontStore', frontStoreRoutes);
router.use('/announcement-bars', announcementBarRoutes);

export default router;