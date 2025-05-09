import { GET_PRODUCTS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
async function getProducts(_, res) {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
        session: session,
        apiVersion: "2024-10"
    });

    const data = await client.request(GET_PRODUCTS);

    res.status(200).json({status:true,data:data?.data});
}
export { getProducts };
