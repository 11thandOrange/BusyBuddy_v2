import express from 'express';
const router = express.Router();
import{ createProductBundleV2 } from '../../controller/bundles/index.js';
router.post('/', createProductBundleV2);
export default router; 