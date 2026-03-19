import express from "express";
import { getRecentActivity, getActivityStats } from "../../controller/activity/index.js";

const router = express.Router();

// GET /api/activity/recent - Get recent activities and stats for history card
router.get("/recent", getRecentActivity);

// GET /api/activity/stats - Get stats only (lighter endpoint)
router.get("/stats", getActivityStats);

export default router;
