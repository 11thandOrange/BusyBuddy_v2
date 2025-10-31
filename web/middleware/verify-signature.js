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

export { verifySHA256 };