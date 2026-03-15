import express from 'express';
const router = express.Router();
import productRoutes from './products/index.js';
import bundleRoutes from './bundles/index.js';
import frontStoreRoutes from './frontStore/index.js';
import announcementBarRoutes from './announcementBars/index.js';
import subscriptionRoutes from './subscription/index.js';
import inactivetabRoutes from './inactivetabs/index.js';
import analyticsRoutes from './analytics/index.js';
import emailProviderRoutes from './emailProvider/index.js';
import googleAnalyticsRoutes from './googleAnalytics/index.js';
// Note: webhookRoutes are mounted separately in web/index.js to bypass session auth
// Note: referralRoutes are registered in web/index.js BEFORE Shopify auth middleware
// to allow public access without shop authentication

router.use('/products', productRoutes);
router.use('/bundles', bundleRoutes);
router.use('/frontStore', frontStoreRoutes);
router.use('/announcement-bars', announcementBarRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/inactive-tab', inactivetabRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/email-provider', emailProviderRoutes);
router.use('/analytics/google', googleAnalyticsRoutes);

export default router;
