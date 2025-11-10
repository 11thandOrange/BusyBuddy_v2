import express from 'express';
const router = express.Router();
import{ getProducts ,getBundleProducts,getOrtdersCount,getCollections} from '../../controller/products/index.js';
router.get('/', getProducts);
router.get('/collections', getCollections);
router.get('/bundel-products', getBundleProducts);
router.get("/fetchOrdersCount",getOrtdersCount)
export default router;