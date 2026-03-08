import express from "express";
const router = express.Router();
import {
  getAnalyticsData
} from "../../controller/analytics/index.js";

// Save inactive tab settings
router.get("/", getAnalyticsData);


export default router;
