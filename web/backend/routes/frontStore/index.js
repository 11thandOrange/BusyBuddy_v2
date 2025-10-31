import express from 'express';
const router = express.Router();
import{ getActiveBundle,getInactiveTab,getAnnouncementBar } from '../../controller/frontStore/index.js';
import { requireSubscriptionAccess } from '../../middleware/subscriptionMiddleware.js';
router.get("/getActiveBundle",requireSubscriptionAccess, getActiveBundle);
router.get("/getInactiveTab", requireSubscriptionAccess,getInactiveTab);
router.get("/getAnnouncementBar",requireSubscriptionAccess, getAnnouncementBar);

export default router;