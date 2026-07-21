#!/usr/bin/env node
// Populates a Shopify dev store ("Daisy's Electronics") with the demo product
// catalog in ./products.json + image URLs in ./images.json.
//
// Required env vars:
//   SHOPIFY_STORE_DOMAIN   e.g. daisys-electronics.myshopify.com
//   SHOPIFY_ADMIN_TOKEN    Custom app Admin API access token (shpat_...)
//
// Usage: node scripts/seed-demo-store/seed.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2025-10";

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN and/or SHOPIFY_ADMIN_TOKEN environment variables."
  );
  process.exit(1);
}

const ENDPOINT = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

async function shopifyGraphql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
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
      nodes { id name }
    }
  }
`;

const INVENTORY_SET_MUTATION = `
  mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      userErrors { field message }
    }
  }
`;

async function main() {
  const products = JSON.parse(
    await readFile(path.join(__dirname, "products.json"), "utf-8")
  );
  const images = JSON.parse(
    await readFile(path.join(__dirname, "images.json"), "utf-8")
  );

  const { locations } = await shopifyGraphql(LOCATIONS_QUERY);
  const locationId = locations.nodes[0]?.id;
  if (!locationId) throw new Error("No fulfillment location found on this store.");
  console.log(`Using location: ${locations.nodes[0].name} (${locationId})`);

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
      variants: [
        {
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
        continue;
      }
      console.log(`✅ ${product.title} -> ${data.productSet.product.handle}`);
    } catch (err) {
      console.error(`❌ ${product.title} failed:`, err.message);
    }
  }

  console.log("\nDone. Review the storefront to confirm images and inventory.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
