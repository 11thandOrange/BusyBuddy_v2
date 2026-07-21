#!/usr/bin/env node
// Populates a Shopify dev store ("Daisy's Electronics") with the demo product
// catalog in ./products.json + image URLs in ./images.json.
//
// Required env vars:
//   SHOPIFY_STORE_DOMAIN     e.g. daisys-electronics-9kihd5yl.myshopify.com
// Auth — provide EITHER of the following:
//   SHOPIFY_ADMIN_TOKEN                    a ready-made Admin API access token (shpat_...), OR
//   SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET   Dev Dashboard app credentials — the script
//                                                exchanges these for an access token itself
//                                                via the client_credentials grant.
//
// Usage: node scripts/seed-demo-store/seed.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const API_VERSION = "2025-10";

if (!STORE_DOMAIN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN environment variable.");
  process.exit(1);
}

const ENDPOINT = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

// Client-credentials access tokens expire after ~24h (Shopify returns
// expires_in ~86399s), so we mint a fresh one per run rather than caching it.
async function getAccessToken() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) {
    return process.env.SHOPIFY_ADMIN_TOKEN;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(
      "Missing credentials: set SHOPIFY_ADMIN_TOKEN, or both SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET."
    );
    process.exit(1);
  }

  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Client credentials token exchange failed: HTTP ${res.status}: ${await res.text()}`
    );
  }

  const { access_token: accessToken } = await res.json();
  if (!accessToken) {
    throw new Error("Token exchange response did not include an access_token.");
  }
  console.log("Obtained Admin API access token via client_credentials grant.");
  return accessToken;
}

let ACCESS_TOKEN;

async function shopifyGraphql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const PRODUCT_SET_MUTATION = `
  mutation productSet($input: ProductSetInput!) {
    productSet(input: $input, synchronous: true) {
      product {
        id
        title
        handle
        variants(first: 1) {
          nodes {
            id
            inventoryItem { id }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const LOCATIONS_QUERY = `
  {
    locations(first: 1) {
      nodes { id }
    }
  }
`;

const PUBLICATIONS_QUERY = `
  {
    publications(first: 20) {
      nodes { id name }
    }
  }
`;

const PUBLISH_MUTATION = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

async function main() {
  ACCESS_TOKEN = await getAccessToken();

  const products = JSON.parse(
    await readFile(path.join(__dirname, "products.json"), "utf-8")
  );
  const images = JSON.parse(
    await readFile(path.join(__dirname, "images.json"), "utf-8")
  );

  const { locations } = await shopifyGraphql(LOCATIONS_QUERY);
  const locationId = locations.nodes[0]?.id;
  if (!locationId) throw new Error("No fulfillment location found on this store.");
  console.log(`Using location: ${locationId}`);

  const { publications } = await shopifyGraphql(PUBLICATIONS_QUERY);
  const onlineStorePublicationId = publications.nodes.find(
    (p) => p.name === "Online Store"
  )?.id;
  if (!onlineStorePublicationId) {
    console.warn("⚠️  No \"Online Store\" publication found — products will not be published to the storefront.");
  } else {
    console.log(`Using publication: Online Store (${onlineStorePublicationId})`);
  }

  let failureCount = 0;

  for (const product of products) {
    const imageUrls = images[product.handle] || [];
    if (imageUrls.length === 0) {
      console.warn(`⚠️  No images configured for "${product.title}" — skipping images.`);
    }

    const input = {
      title: product.title,
      handle: product.handle,
      descriptionHtml: `<p>${product.description}</p>`,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      status: "ACTIVE",
      files: imageUrls.map((url) => ({
        originalSource: url,
        contentType: "IMAGE",
      })),
      productOptions: [
        {
          name: "Title",
          values: [{ name: "Default Title" }],
        },
      ],
      variants: [
        {
          optionValues: [{ optionName: "Title", name: "Default Title" }],
          price: product.price,
          inventoryPolicy: "DENY",
          inventoryQuantities: [
            {
              locationId,
              name: "available",
              quantity: product.inventoryQuantity,
            },
          ],
        },
      ],
    };

    try {
      const data = await shopifyGraphql(PRODUCT_SET_MUTATION, { input });
      const errors = data.productSet.userErrors;
      if (errors.length > 0) {
        console.error(`❌ ${product.title}:`, errors);
        failureCount++;
        continue;
      }
      console.log(`✅ ${product.title} -> ${data.productSet.product.handle}`);

      if (onlineStorePublicationId) {
        const publishData = await shopifyGraphql(PUBLISH_MUTATION, {
          id: data.productSet.product.id,
          input: [{ publicationId: onlineStorePublicationId }],
        });
        const publishErrors = publishData.publishablePublish.userErrors;
        if (publishErrors.length > 0) {
          console.warn(`⚠️  ${product.title}: publish issue —`, publishErrors);
        }
      }
    } catch (err) {
      console.error(`❌ ${product.title} failed:`, err.message);
      failureCount++;
    }
  }

  console.log("\nDone. Review the storefront to confirm images and inventory.");
  if (failureCount > 0) {
    console.error(`${failureCount} of ${products.length} products failed.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
