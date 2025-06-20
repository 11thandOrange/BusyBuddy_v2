import express from 'express';
const router = express.Router();
import{ createMixAndMatchBundle, createProductBundleV2, getActiveBundles,getShopBundles} from '../../controller/bundles/index.js';

router.post('/', createProductBundleV2);
router.get('/', getShopBundles);
router.get('/activeBundles', getActiveBundles);

router.post('/mix-and-match', createMixAndMatchBundle);

export default router;