import { GET_PRODUCTS, GET_BUNDLE_PRODUCTS, GET_COLLECTIONS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
import Shop from "../../models/shop.model.js";
async function getProducts(req, res) {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({
    session,
    apiVersion: "2025-07",
  });

  const { cursor, search, ids } = req.query;
  console.log("Cursor received in getProducts:", cursor);
  const query = `
    query getProducts($cursor: String, $searchQuery: String!) {
      products(first: 10, after: $cursor, sortKey: CREATED_AT, reverse: true, query: $searchQuery) {
        edges {
          node {
            id
            title
            descriptionHtml
            featuredMedia {
              ... on MediaImage {
                id
                image { url }
              }
            }
            images(first: 10) {
              edges {
                node { url }
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
            metafields(first: 20) {
              nodes {
                namespace
                key
                value
                type
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

  // Product search is a merchant browsing their own catalog, not a trust
  // boundary - but it's still interpolated into Shopify's search query DSL,
  // so quotes/backslashes are escaped to keep the term from breaking out of
  // the title:*...* clause.
  const baseFilter = "bundles:false AND tag_not:busybuddybundles";
  let searchQuery;
  if (typeof ids === "string" && ids.trim()) {
    // Editing an existing bundle, or refreshing already-selected products,
    // needs specific products back rather than a title search - match them
    // by id instead. IDs are the bare numeric Shopify product id (the same
    // convention already used in controller/frontStore/index.js), never
    // user-typed text, so no escaping is needed here.
    const idFilter = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => `id:${id}`)
      .join(" OR ");
    searchQuery = idFilter ? `${baseFilter} AND (${idFilter})` : baseFilter;
  } else {
    const escapedSearch = typeof search === "string" ? search.trim().replace(/["\\]/g, "\\$&") : "";
    searchQuery = escapedSearch ? `${baseFilter} AND title:*${escapedSearch}*` : baseFilter;
  }

  try {
    const response = await client.request(query, {
      variables: { cursor: cursor || null, searchQuery },
    });
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
    apiVersion: "2025-07",
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

    const shopData = await Shop.findOne({ myshopify_domain: shopDomain });
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
