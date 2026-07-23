import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

const verifySHA256 = (req) => {
    const query = req.query;

    var parameters = [];
    for (var key in query) {
        if (key != 'signature') {
            parameters.push(key + '=' + query[key])
        }
    }

    const message = parameters.sort().join('');

    const digest = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET).update(message).digest('hex');

    return digest === query.signature;
}

// Server-side counterpart to verifySHA256, using the identical algorithm
// (sorted "key=value" params, HMAC-SHA256 with SHOPIFY_API_SECRET) so a
// signature generated here always verifies there. Used to mint a signed
// shop param for the standalone editor (see web/index.js's serveEditorHtml),
// which has no App Bridge session token available to authenticate its own
// /api/* calls with.
const generateSignature = (params) => {
    const parameters = Object.entries(params).map(([key, value]) => `${key}=${value}`);
    const message = parameters.sort().join('');
    return crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET).update(message).digest('hex');
}

// Verifies a signature minted by generateSignature({shop}) - unlike
// verifySHA256 (which signs every query param present on the request, for
// verifying Shopify's own outbound redirects where Shopify controls and
// signs the full param set), this checks only the shop value the token was
// actually minted for. Editor API calls legitimately carry other
// business-logic query params (search, cursor, ...) that were never part of
// what was signed, so including them in the check would reject every editor
// request that isn't a bare shop-only lookup.
const verifyShopSignature = (shop, signature) => {
    if (!shop || !signature) return false;
    return generateSignature({ shop }) === signature;
}

export { verifySHA256, generateSignature, verifyShopSignature };