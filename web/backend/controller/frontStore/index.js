import { GET_PRODUCTS, GET_PRODUCT_BY_IDS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
import Bundle from "../../models/bundle.model.js";
// async function getActiveBundle(req, res) {
//   // In your backend route handler
//   try {
//     const productId = req.query.product_id;
//     console.log("productId", productId);
//     // Query your database for bundles containing this product
//     const bundles = await Bundle.find({
//       $or: [
//         { "products.productId": `gid://shopify/Product/${productId}` },
//         { "products.x.productId": `gid://shopify/Product/${productId}` },
//         { "products.y.productId": `gid://shopify/Product/${productId}` },
//       ],
//     //   status: "ACTIVE", // Only active bundles
//     //   startDate: { $lte: new Date() }, // Started already
//     //   endDate: { $gte: new Date() }, // Not expired
//     }).lean();

//     if (!bundles || bundles.length === 0) {
//       return res.json({ bundles: [] });
//     }
//     console.log("bundles", bundles);
//     // Get all product IDs from these bundles (excluding the current product)
//     // const allProductIds = bundles.flatMap((bundle) => {
//     //   let products = [];
//     //   if (bundle.type === "Buy One Get One") {
//     //     products = [...bundle.products.x, ...bundle.products.y];
//     //   } else {
//     //     products = bundle.products;
//     //   }
//     //   return products.map((p) => p.productId).filter((id) => id !== productId);
//     // });
//   const allProductIds = bundles.flatMap((bundle) => {
//       let products = [];
//       if (bundle.type === "Buy One Get One") {
//         products = [...bundle.products.x, ...bundle.products.y];
//       } else {
//         products = bundle.products;
//       }
//       return products.map((p) => p.productId.replace('gid://shopify/Product/', ''))
//                     .filter((id) => id !== productId);
//     });
//     // Get unique product IDs
//      const uniqueProductIds = [...new Set(allProductIds)];

//     if (uniqueProductIds.length === 0) {
//       return res.json({ bundles: [] });
//     }
//     // const products = await shopify.product.list({
//     //   ids: uniqueProductIds.join(","),
//     //   limit: 10,
//     //   fields: "id,title,images,variants",
//     // });

//     // // Map products to a more usable format
//     // const productMap = products.reduce((map, product) => {
//     //   map[product.id] = {
//     //     id: product.id,
//     //     title: product.title,
//     //     price: product.variants[0]?.price,
//     //     compare_at_price: product.variants[0]?.compare_at_price,
//     //     image: product.images[0]?.src,
//     //     variant_id: product.variants[0]?.id,
//     //     available: product.variants[0]?.inventory_quantity > 0,
//     //   };
//     //   return map;
//     // }, {});

//     // Enhance bundles with product data
//     // const enhancedBundles = bundles.map((bundle) => {
//     //   let products = [];
//     //   if (bundle.type === "Buy One Get One") {
//     //     products = {
//     //       x: bundle.products.x.map((p) => ({
//     //         ...p,
//     //         ...(productMap[p.productId] || {}),
//     //       })),
//     //       y: bundle.products.y.map((p) => ({
//     //         ...p,
//     //         ...(productMap[p.productId] || {}),
//     //       })),
//     //     };
//     //   } else {
//     //     products = bundle.products.map((p) => ({
//     //       ...p,
//     //       ...(productMap[p.productId] || {}),
//     //     }));
//     //   }

//     //   return {
//     //     ...bundle,
//     //     products,
//     //   };
//     // });

//     return res.status(200).json({ status: true, bundles: enhancedBundles });
//   } catch (error) {
//     console.error("Error fetching bundles:", error);
//     res.status(500).json({ error: "Failed to load bundles" });
//   }
// }
async function getActiveBundle(req, res) {
    try {
        const productId = req.query.product_id;
        // const productId = req.query.product_id;
        console.log("productId", productId);

        // Get session for the shop (required for API calls)
        const session = res.locals.shopify.session;
        const client = new shopify.api.clients.Graphql({
            session: session,
            apiVersion: "2024-10", // Ensure this is a valid and supported API version
        });
        // Query your database for bundles containing this product
        // const bundles = await Bundle.find({
        //   $or: [
        //     { "products.productId": `gid://shopify/Product/${productId}` },
        //     { "products.x.productId": `gid://shopify/Product/${productId}` },
        //     { "products.y.productId": `gid://shopify/Product/${productId}` },
        //   ],
        // }).lean();
        const bundles = await Bundle.find({
            "products.productId": `gid://shopify/Product/${productId}`,
            status: true,
        }).limit(1).lean();

        console.log("bundles", bundles);
        if (!bundles || bundles.length === 0) {
            return res.json({ bundles: [] });
        }

        // Get all product IDs from these bundles (excluding the current product)
        const allProductIds = bundles.flatMap((bundle) => {
            const products = Array.isArray(bundle.products) ? bundle.products : [];
            console.log("products", products.map((p) => p.productId.replace("gid://shopify/Product/", ""))
                .filter((id) => id !== productId));
            return products
                .map((p) => p.productId.replace("gid://shopify/Product/", ""))
                .filter((id) => id !== productId);
        });

        // const allProductIds = bundles.flatMap((bundle) => {
        //   let products = [];
        //   if (bundle.type === "Buy One Get One") {
        //     products = [...bundle.products.x, ...bundle.products.y];
        //   } else {
        //     products = bundle.products;
        //   }
        //   return products
        //     .map((p) => p.productId.replace("gid://shopify/Product/", ""))
        //     .filter((id) => id !== productId);
        // });

        // Get unique product IDs
        const uniqueProductIds = [...new Set(allProductIds)];
        console.log("uniqueProductIds", uniqueProductIds);
        if (uniqueProductIds.length === 0) {
            return res.json({ bundles: [] });
        }

        // Create REST client from session
        // const client = new shopify.clients.Rest({ session });

        // Fetch product details from Shopify
        const response = await client.request(GET_PRODUCT_BY_IDS(uniqueProductIds));
        // console.log(" getActiveBundle | response:", response)

        const products = response.data.products.edges.map((edge) => edge.node);
        console.log("Products", products);
        // Map products to a more usable format
        const productMap = {};
        products.forEach((product) => {
            productMap[product.id] = {
                id: product.id,
                title: product.title,
                price: product.variants[0]?.price, 
                compare_at_price: product.variants[0]?.compare_at_price,
                image: (product.images && product.images[0]?.src) || null,
                variant_id: product.variants[0]?.id,
                available: product.variants[0]?.inventory_quantity > 0,
                handle: product.handle,
            };
        });

        // Enhance bundles with product data
        const enhancedBundles = bundles.map((bundle) => {
            let products = [];
            if (bundle.type === "Buy One Get One") {
                products = {
                    x: bundle.products.x.map((p) => ({
                        ...p,
                        ...(productMap[p.productId.replace("gid://shopify/Product/", "")] || {}),
                    })),
                    y: bundle.products.y.map((p) => ({
                        ...p,
                        ...(productMap[p.productId.replace("gid://shopify/Product/", "")] || {}),
                    })),
                };
            } else {
                products = bundle.products.map((p) => ({
                    ...p,
                    ...(productMap[p.productId.replace("gid://shopify/Product/", "")] || {}),
                }));
            }

            return {
                ...bundle,
                products,
            };
        });

        return res.status(200).json({ status: true, bundles: enhancedBundles });
    } catch (error) {
        console.error("Error fetching bundles:", error);
        res.status(500).json({ error: "Failed to load bundles" });
    }
}
export { getActiveBundle };
