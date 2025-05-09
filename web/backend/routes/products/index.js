import express from 'express';
const router = express.Router();
import{ getProducts } from '../../controller/products/index.js';
router.get('/', getProducts);
export default router;