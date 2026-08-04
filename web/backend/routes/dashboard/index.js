import express from "express";
import { getDashboardSummary } from "../../controller/dashboard/index.js";

const router = express.Router();

// GET /api/dashboard/summary - Real per-widget revenue/impressions for the home screen
router.get("/summary", getDashboardSummary);

export default router;
