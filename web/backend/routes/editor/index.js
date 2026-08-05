import express from 'express';
import { generateSignature } from '../../../middleware/verify-signature.js';

const router = express.Router();

// Called by the main embedded app (already authenticated via the normal
// App Bridge session) right before it opens the standalone editor tab.
// Mints the same signature web/index.js used to bake into editor.html via
// server-side template substitution - moving it here means the standalone
// editor gets a real, working shop/signature pair from the URL the moment
// it opens, regardless of whether /editor.html itself is served by Express
// (production) or by Vite's dev server directly (local `npm run dev`,
// which never runs Express's substitution at all).
router.get('/signature', (req, res) => {
  const shop = res.locals.shopify?.session?.shop;
  if (!shop) {
    return res.status(401).json({ message: 'No authenticated session for this request.' });
  }
  return res.status(200).json({ shop, signature: generateSignature({ shop }) });
});

export default router;
