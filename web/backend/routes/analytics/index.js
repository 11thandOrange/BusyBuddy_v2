import express from "express";
const router = express.Router();
import {
  getAnalyticsData
} from "../../controller/analytics/index.js";
import googleAnalyticsRoutes from "../googleAnalytics/index.js";

// Shopify analytics data
router.get("/", getAnalyticsData);

// Google Analytics routes (mounted at /api/analytics/google/*)
router.use("/google", googleAnalyticsRoutes);

export default router;
