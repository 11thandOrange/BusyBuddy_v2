---
name: backend-frontend-conventions
description: >-
  Stack-specific implementation conventions for web/backend (Express + Mongoose)
  and web/frontend (React + Polaris) in BusyBuddy_v2 — route/controller/model
  split, shop-scoping, Polaris/Redux patterns, and test setup.
applies_to: "repo:11thandOrange/BusyBuddy_v2"
---

# BusyBuddy_v2 Backend/Frontend Conventions

Stack-specific implementation conventions for `web/backend` (Express +
Mongoose) and `web/frontend` (React + Polaris). This is repo-local, not a
shared skill, because it's specific to this stack — Node/Express/Mongoose/
React/Polaris — not something every future project on this pipeline shares.

## Problem

The routing/controller/model split and the React/Redux/Polaris conventions
here aren't self-evident from any single file — they're a pattern repeated
across ~15 features. Getting the shop-scoping convention wrong (see below) is
the easiest way to write a feature that leaks data across merchants.

## Backend: Route → Controller → Model

```
web/backend/
├── routes/<feature>/index.js       # Express router — thin, no logic
├── controller/<feature>/index.js    # req/res handlers, Shopify GraphQL calls
├── models/<feature>.model.js        # Mongoose schema
└── services/                        # Shared logic (e.g. activityLogService, mutations.js)
```

**Route** (`routes/<feature>/index.js`):
```javascript
import express from "express";
const router = express.Router();
import { createItem, getItems, updateItem, deleteItem } from "../../controller/<feature>/index.js";

router.post("/", createItem);
router.get("/", getItems);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
```
Register in `web/backend/routes/index.js`:
```javascript
import featureRoutes from "./<feature>/index.js";
router.use("/<feature>", featureRoutes);
```

**Controller**: async handlers, `try/catch` returning 500 on error. Shop
context comes from `res.locals.shopify.session` (confirmed used in 9+
controllers — `frontStore`, `googleAnalytics`, `inactivetab`, `products`,
`subscription`, `analytics`, `announcementBars`, `bundles`,
`emailProvider`), typically `res.locals.shopify.session.shop`. For Shopify
Admin GraphQL calls from a controller:
```javascript
const { admin } = await shopify.authenticate.admin(req, res);
const response = await admin.graphql(`mutation { ... }`);
const data = await response.json();
```

**Model / shop-scoping — two real patterns coexist, not one uniform field.**
Don't assume every model scopes to a shop the same way; check similar
existing models before adding a new one:
- Some models reference the Shop doc by ObjectId, e.g. `bundle.model.js`:
  `shopId: { type: Schema.Types.ObjectId, required: true }`
- Others store the shop domain directly, e.g. `inactiveTab.model.js`:
  `myshopify_domain: { type: String, required: true, unique: true }`

Pick whichever pattern the feature's sibling models already use rather than
introducing a third convention.

## Frontend: Pages → App Modules → Components

```
web/frontend/
├── pages/<feature>.jsx          # React Router page
├── apps/<feature>/              # Form/Actions/Reducers per feature
├── components/                  # Shared UI (Analytics, Settings, Modals)
├── features/                    # Redux Toolkit slices (shared global state)
└── hooks/
```

**Page pattern**:
```jsx
import { Page, Layout, Card } from "@shopify/polaris";
import FeatureForm from "../apps/<feature>/FeatureForm";

export default function FeaturePage() {
  return (
    <Page title="Feature Name">
      <Layout>
        <Layout.Section>
          <Card><FeatureForm /></Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

**API calls** — always relative paths (Vite proxies `/api/*` to the backend):
```javascript
const response = await fetch("/api/<feature>/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

**State**: `useState`/`useEffect` for local component state, `@reduxjs/toolkit`
slices under `web/frontend/features/` for shared global state, `react-query`
for server state/caching.

## Code Rules (verified against actual code, not just asserted)

- `async/await` throughout — no `.then()` chains.
- Every controller `async` handler wraps in `try/catch` returning 500.
- Polaris (`@shopify/polaris`) components only for admin UI — no raw HTML
  tables/buttons.
- ES modules only (`import`/`export`) — no `require()`.
- No hardcoded shop URLs, API endpoints, or credentials — `process.env.*`.

## Running Tests

```bash
cd web && npm test                 # vitest run --config backend/vitest.config.js
cd web/frontend && npm test         # vitest run (vite-based config)
cd web && npm run test:coverage
cd web/frontend && npm run coverage
```

Backend tests run with `environment: 'node'` — no DOM APIs. Frontend tests
run with `environment: 'jsdom'`.

### Frontend test setup (`web/frontend/tests/setup.js`) already mocks:
- `window.fetch`, `window.open`, `window.location` (`?shop=test-shop.myshopify.com`)
- `react-router-dom`'s `useNavigate`/`useLocation`/`useParams`
- `@shopify/app-bridge-react` (`useAppBridge`, `Provider`)
- `@shopify/polaris`'s `AppProvider` (passes children through)

Don't re-mock these per-test — they're global. Mock model methods
(`vi.mock('../../models/<feature>.model.js', ...)`) for backend controller
tests instead of hitting real MongoDB.

## Never Do

- Use `require()` — ES modules only.
- Block the event loop with synchronous I/O.
- Commit `node_modules/`, `.env`, or any secret.
- Assume a single shop-scoping field name across models — check the
  feature's existing sibling models first (see above).
