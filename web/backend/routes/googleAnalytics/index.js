import express from "express";
const router = express.Router();
import {
  getGoogleStatus,
  initiateGoogleConnect,
  handleGoogleCallback,
  disconnectGoogle,
  getGoogleAnalyticsData,
} from "../../controller/googleAnalytics/index.js";

// GET /api/analytics/google/status - Check connection status
router.get("/status", getGoogleStatus);

// POST /api/analytics/google/connect - Initiate OAuth connection
router.post("/connect", initiateGoogleConnect);

// GET /api/analytics/google/callback - OAuth callback handler
router.get("/callback", handleGoogleCallback);

// POST /api/analytics/google/disconnect - Disconnect Google account
router.post("/disconnect", disconnectGoogle);

// GET /api/analytics/google/data - Fetch analytics data
router.get("/data", getGoogleAnalyticsData);

export default router;
