import express from 'express';
const router = express.Router();
import{ getActiveBundle } from '../../controller/frontStore/index.js';

router.get("/getActiveBundle", getActiveBundle);

export default router;