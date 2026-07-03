# BusyBuddy_v2 Cart Transformer Extension

Domain knowledge for `extensions/cart-transformer` — the Shopify Function that
implements bundle-discount pricing at checkout. This is narrow, easy-to-get-wrong
detail specific to this extension; general JS/repo conventions live in the
shared project-conventions skill, not here.

## Problem

Unlike the theme extension (storefront UI), this is a server-side Shopify
Function: it has no UI, can't be manually clicked through, and its correctness
depends entirely on matching an exact GraphQL input schema and metafield/attribute
naming that isn't discoverable by reading `run.js` in isolation.

## Where It Lives

```
extensions/cart-transformer/
├── src/
│   ├── index.js       # barrel: `export * from './run'`
│   ├── run.js          # the actual function logic (exported as `run`)
│   ├── run.graphql      # input query — defines exactly what cart data the function receives
│   └── run.test.js      # Vitest tests
├── schema.graphql        # full Shopify Function API schema (generated/reference, don't hand-edit)
├── shopify.extension.toml # target, entrypoint, build config
└── package.json
```

`shopify.extension.toml` wires it together:
- `target = "purchase.cart-transform.run"` — this runs during checkout cart transform
- `input_query = "src/run.graphql"` — the query below
- `export = "run"` — must match the named export in `run.js`

## The Input Schema (the part that's easy to get wrong)

`run.graphql` currently requests:
- `presentmentCurrencyRate` (top-level)
- Per cart line:
  - `bundleVariantIds`: a **cart-line attribute**, not a metafield — key
    `_bundle_product_variant_ids` (leading underscore is part of the real key)
  - On the line's `ProductVariant` → `product`, three **metafields** under
    namespace `"busy-buddy"`:
    - `bundle_discount_type` → aliased `bundledDiscountType`
    - `bundle_discount_value` → aliased `bundledDiscountValue`
    - `bundle_discount_products` → aliased `bundledProducts`

If you need more cart data, add it to `run.graphql` — the function only sees
what's explicitly queried. Getting the attribute-vs-metafield distinction or
the `busy-buddy` namespace wrong is the most common way to silently get `null`
values back with no error.

## What `run()` Actually Does

For each cart line, `optionallyBuildExpandOperation`:
1. Only acts on `ProductVariant` lines that have a `bundleVariantIds` attribute value.
2. Parses `bundledProducts` (format: comma-separated `variantId:price` pairs) into
   `{ id, price }` objects, applying the discount:
   - `bundleDiscountType === "percentage"` → `price -= price * (discountAmount / 100)`
   - `bundleDiscountType === "fixed"` → `price -= discountAmount / bundleProductsLength`
     (the fixed discount is split evenly across the bundle's product count)
   - `discountAmount` itself is read from `bundleDiscounts[bundleProductsLength - 2]`
     — i.e. the discount tiers array is indexed by bundle size, not a flat value.
3. Filters `bundleVariantIds` down to only the IDs that also appear in `bundledProducts`.
4. Throws `"Invalid bundle composition"` if the filtered result is empty but
   `bundleProducts` was non-empty — this is a real thrown error, not a caught/logged
   one, so a malformed metafield value will fail the whole checkout transform for
   that line, not just skip it.
5. Returns one `{ expand: { cartLineId, expandedCartItems } }` operation per
   qualifying line, or `{ operations: [] }` if nothing qualifies.

Each `expandedCartItems` entry sets `price.adjustment.fixedPricePerUnit` — this
function always emits a fixed per-unit price, never a percentage-off operation,
even when the underlying discount type is `"percentage"` (the percentage math
happens before emission, producing a final fixed price).

## Constraints (Shopify Function requirements, not just style)

- Must be **pure and synchronous** — no `async`, no network calls, no side
  effects. Shopify Functions compile to WASM and run in a sandboxed runtime
  with strict execution limits; this isn't a lint preference.
- Keep logic fast — this runs on every checkout, so added complexity here is
  latency on the checkout critical path for every customer.
- All input data must come through `run.graphql` — you cannot reach out for
  more data mid-function.

## Running Tests

```bash
cd extensions/cart-transformer
npm test          # vitest run
npm run test:watch
```

Current coverage (`run.test.js`) is thin — only the empty-cart case is tested.
If you touch `run.js`, add cases for: a qualifying bundle line (percentage
discount), a qualifying bundle line (fixed discount), a non-bundle line, and
the invalid-bundle-composition throw path — none of those are currently covered.

## Regenerating Types

```bash
npm run typegen    # shopify app function typegen — regenerates generated/api.ts from schema.graphql
```

Run this after changing `run.graphql` so the `FunctionRunResult`/input types
referenced in JSDoc stay accurate.

## Never Do

- Add `async`/await, `fetch`, or any I/O inside `run()` or the functions it calls.
- Hand-edit `schema.graphql` — it's the Shopify Function API schema, not
  project-specific config.
- Assume `bundleVariantIds` is a metafield — it's a cart-line **attribute**
  (`attribute(key: "_bundle_product_variant_ids")`), a different GraphQL shape
  than the `metafield(namespace:, key:)` calls used for the other three fields.
- Change the `busy-buddy` metafield namespace without confirming the merchant
  Admin UI / metafield definitions that populate it are updated in lockstep —
  this function only reads what's already set there.

---

# BusyBuddy_v2 Theme Extension (bogo-shopify-app)

Shorter reference for the storefront-facing half of `extensions/` — Liquid
blocks + vanilla JS assets rendered in the Shopify theme editor.

## Structure

```
extensions/bogo-shopify-app/
├── blocks/        # Liquid blocks — placed by merchants in the theme editor
├── assets/        # Vanilla JS + CSS loaded by blocks on storefront pages
├── snippets/       # Reusable Liquid partials
├── locales/
└── shopify.extension.toml   # type = "theme"
```

## Block Conventions

- `{% schema %}` block's `"target"` must be `"section"` for it to appear in
  the theme editor.
- Settings defined in `{% schema %}` become `block.settings.<id>` in Liquid —
  pass them to JS via `data-*` attributes on the `<script>` tag, never hardcode
  values in the JS file itself.
- Script tags load `defer` — never block storefront page rendering.

## Asset (JS) Conventions

- Plain vanilla JS, loaded as **classic scripts** — no `import`/`export`
  syntax; these are not bundled or transpiled.
- Always guard on element existence first: `if (!el) return;` before doing
  anything, since the block may not be present on every page.
- Read configuration from `dataset.*` (set via the block's `data-*` attributes),
  not from hardcoded constants.

## Never Do

- Use ES module syntax in `assets/*.js` — it will fail silently as a classic script.
- Touch `web/` from here — that's the main app's domain, not this extension's.
