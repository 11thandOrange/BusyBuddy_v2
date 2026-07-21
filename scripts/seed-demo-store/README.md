# Demo Store Seeder — Daisy's Electronics

Standalone script to populate the "Daisy's Electronics" Shopify demo store
with ~25 nostalgic electronics products. Independent of the BusyBuddy app —
does not touch `web/`.

## Setup

1. Create a Custom App in the target store's admin (Settings → Apps and
   sales channels → Develop apps) with scopes: `write_products`,
   `read_products`, `write_inventory`, `read_inventory`, `write_files`,
   `read_files`. Install it and copy the Admin API access token.

2. Export credentials (do not commit these):
   ```bash
   export SHOPIFY_STORE_DOMAIN="daisys-electronics.myshopify.com"
   export SHOPIFY_ADMIN_TOKEN="shpat_..."
   ```

3. Run:
   ```bash
   node scripts/seed-demo-store/seed.mjs
   ```

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
