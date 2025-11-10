import express from "express";
const router = express.Router();
import {
  createMixAndMatchBundle,
  createProductBundleV2,
  getActiveBundles,
  getShopBundles, 
  deleteBundle,
  updateBundle,
  updateMixAndMatchBundle
} from "../../controller/bundles/index.js";

router.post("/", createProductBundleV2);
router.get("/", getShopBundles);
router.get("/activeBundles", getActiveBundles);

router.post("/mix-and-match", createMixAndMatchBundle);
router.post("/mix-and-match/:id", updateMixAndMatchBundle);

router.delete("/:id", deleteBundle); //delete product bundel
router.put("/:id", updateBundle); //update product bundel

export default router;
