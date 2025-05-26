import express from 'express';
const router = express.Router();
import{ createProductBundleV2, getActiveBundles} from '../../controller/bundles/index.js';

router.post('/', createProductBundleV2);
router.get('/activeBundles', getActiveBundles);

export default router;