#!/usr/bin/env node
// Diagnostic: reports media status for every product in products.json so we
// can tell which image URLs actually resolved vs failed to process.
//
// Same env vars as seed.mjs (SHOPIFY_STORE_DOMAIN + either SHOPIFY_ADMIN_TOKEN
// or SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET).
//
// Usage: node scripts/seed-demo-store/check-images.mjs

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

async function getAccessToken() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) {
    return process.env.SHOPIFY_ADMIN_TOKEN;
  }
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const { access_token } = await res.json();
  return access_token;
}

async function main() {
  const accessToken = await getAccessToken();
  const products = JSON.parse(
    await readFile(path.join(__dirname, "products.json"), "utf-8")
  );

  const query = `
    query productMedia($handle: String!) {
      productByHandle(handle: $handle) {
        title
        media(first: 5) {
          nodes {
            status
            ... on MediaImage {
              image { url }
            }
          }
        }
      }
    }
  `;

  for (const product of products) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables: { handle: product.handle } }),
    });
    const json = await res.json();
    const p = json.data?.productByHandle;
    if (!p) {
      console.log(`${product.handle}: NOT FOUND`, JSON.stringify(json.errors));
      continue;
    }
    if (p.media.nodes.length === 0) {
      console.log(`${p.title}: NO MEDIA`);
    } else {
      for (const m of p.media.nodes) {
        console.log(`${p.title}: status=${m.status} url=${m.image?.url || "(none)"}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
