# Demo Store Seeder — Daisy's Electronics

Standalone script to populate the "Daisy's Electronics" Shopify demo store
with ~25 nostalgic electronics products. Independent of the BusyBuddy app —
does not touch `web/`.

## Setup

1. Create an app for the target store (Dev Dashboard, or a Custom App via
   Settings → Apps and sales channels → Develop apps) with Admin API scopes:
   `write_products`, `read_products`, `write_inventory`, `read_inventory`,
   `write_files`, `read_files`.

2. Export credentials (do not commit these). Either form works — the script
   handles both:

   **Option A — Client ID/Secret (Dev Dashboard apps).** The script performs
   the `client_credentials` token exchange itself at runtime; no separate
   token-fetching step needed:
   ```bash
   export SHOPIFY_STORE_DOMAIN="daisys-electronics-9kihd5yl.myshopify.com"
   export SHOPIFY_CLIENT_ID="..."
   export SHOPIFY_CLIENT_SECRET="..."
   ```

   **Option B — a ready-made Admin API access token** (Custom App token):
   ```bash
   export SHOPIFY_STORE_DOMAIN="daisys-electronics-9kihd5yl.myshopify.com"
   export SHOPIFY_ADMIN_TOKEN="shpat_..."
   ```

3. Run:
   ```bash
   node scripts/seed-demo-store/seed.mjs
   ```

Client-credentials tokens expire after ~24h, so the script always mints a
fresh one per run rather than caching it — safe to re-run any time.

## Files

- `products.json` — the 25-product catalog (title, description, price,
  vendor, product type, tags, inventory quantity).
- `images.json` — maps each product `handle` to an array of stock image
  URLs (Unsplash, free commercial-use license) used for the featured image
  and any additional gallery images.
- `seed.mjs` — reads both fixtures and creates/updates products via the
  Admin GraphQL `productSet` mutation, then sets inventory at the store's
  first fulfillment location.

The script is idempotent — it upserts by `handle`, so it can be re-run
safely if interrupted partway through.
