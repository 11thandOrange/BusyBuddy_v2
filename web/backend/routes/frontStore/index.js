import express from 'express';
const router = express.Router();
import{ getActiveBundle,getInactiveTab,getAnnouncementBar, subscribeEmail } from '../../controller/frontStore/index.js';
import { requireSubscriptionAccess } from '../../middleware/subscriptionMiddleware.js';
router.get("/getActiveBundle",requireSubscriptionAccess, getActiveBundle);
router.get("/getInactiveTab", requireSubscriptionAccess,getInactiveTab);
router.get("/getAnnouncementBar",requireSubscriptionAccess, getAnnouncementBar);
router.post("/subscribe", requireSubscriptionAccess, subscribeEmail);

export default router;