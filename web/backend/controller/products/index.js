import { GET_PRODUCTS, GET_BUNDLE_PRODUCTS, GET_COLLECTIONS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
async function getProducts(_, res) {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({
    session: session,
    apiVersion: "2024-10",
  });

  const data = await client.request(GET_PRODUCTS);

  res.status(200).json({ status: true, data: data?.data });
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

export { getProducts, getBundleProducts, getOrtdersCount, getCollections };
