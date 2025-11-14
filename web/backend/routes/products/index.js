import express from 'express';
const router = express.Router();
import{ getProducts ,getBundleProducts,getOrtdersCount,getCollections,fetchStoreCurrency} from '../../controller/products/index.js';
router.get('/', getProducts);
router.get('/collections', getCollections);
router.get('/bundel-products', getBundleProducts);
router.get("/fetchOrdersCount",getOrtdersCount)
router.get("/currency",fetchStoreCurrency)
export default router;