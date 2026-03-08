import express from 'express';
const router = express.Router();
import productRoutes from './products/index.js';
import bundleRoutes from './bundles/index.js';
import frontStoreRoutes from './frontStore/index.js';
import announcementBarRoutes from './announcementBars/index.js';
import subscriptionRoutes from './subscription/index.js';
import inactivetabRoutes from './inactivetabs/index.js';
import analyticsRoutes from './analytics/index.js';
import webhookRoutes from './webhooks/index.js';

router.use('/products', productRoutes); 
router.use('/bundles', bundleRoutes);
router.use('/frontStore', frontStoreRoutes);
router.use('/announcement-bars', announcementBarRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/inactive-tab', inactivetabRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/webhooks', webhookRoutes);

export default router;