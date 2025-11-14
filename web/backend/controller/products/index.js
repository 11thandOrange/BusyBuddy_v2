import { GET_PRODUCTS, GET_BUNDLE_PRODUCTS, GET_COLLECTIONS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
import Shop from "../../models/shop.model.js";
async function getProducts(req, res) {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({
    session,
    apiVersion: "2025-10",
  });

  const { cursor } = req.query;
  console.log("Cursor received in getProducts:", cursor);
  const query = `
    query getProducts {
      products(first: 10, after: ${cursor?`"${cursor}"`:null}, sortKey: CREATED_AT, reverse: true, query: "bundles:false AND tag_not:busybuddybundles") {
        edges {
          node {
            id
            title
            featuredMedia {
              ... on MediaImage {
                id
                image { url }
              }
            }
            options(first: 100) {
              id
              name
              values
            }
            variants(first: 100) {
              nodes {
                price
                title
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    const response = await client.request(query);
    const { edges, pageInfo } = response.data.products;
    res.status(200).json({
      status: true,
      data: { edges, pageInfo },
    });
  } catch (err) {
    console.error("Shopify Product Fetch Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
}


async function getCollections(_, res) {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({
    session: session,
    apiVersion: "2025-10",
  });

  const data = await client.request(GET_COLLECTIONS);
  res.status(200).json({ status: true, data: data?.data });
}
async function getBundleProducts(req, res) {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2025-07",
    });

    // Get all products (not just 100)
    const allProducts = await fetchAllProducts(client);

    // Filter only bundles
    const bundles = allProducts.filter((product) => product.tags.includes("busybuddybundles"));

    res.status(200).json({
      status: true,
      count: bundles.length,
      bundles,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}
async function getOrtdersCount(req, res) {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2025-07",
    });

    const GET_ORDERS = `
      {
        ordersCount(limit: 2000) {
        count
        precision
  }
}`;

    const data = await client.request(GET_ORDERS);
    res.status(200).json({
      status: true,
      data: data.data.ordersCount.count,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

async function fetchAllProducts(client) {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const response = await client.request(GET_BUNDLE_PRODUCTS, { cursor });

    const products = response?.data?.products?.nodes || [];
    const pageInfo = response?.data?.products?.pageInfo;

    allProducts = [...allProducts, ...products];
    hasNextPage = pageInfo?.hasNextPage;
    cursor = pageInfo?.endCursor;
  }

  return allProducts;
}

async function fetchStoreCurrency(req, res) {
  try {
    const shopDomain = res.locals.shopify.session.shop;

    const shopData = await Shop.findOne({ shopDomain });
    if (!shopData) {
      return res.status(400).json({ status: false, message: "Shop not found" });
    }

    const currencyCode = shopData.data.currency || "USD";

    // Use Intl API to extract symbol dynamically
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    });

    // Example: get symbol from formatted string
    const sample = formatter.format(1); // e.g. "$1.00" or "₹1.00"
    const symbol = sample.replace(/[0-9.,\s]/g, "").trim() || currencyCode;

    res.status(200).json({
      status: true,
      currency: currencyCode,
      symbol,
    });
  } catch (error) {
    console.error("Error fetching store currency:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

export { getProducts, getBundleProducts, getOrtdersCount, getCollections, fetchStoreCurrency };
