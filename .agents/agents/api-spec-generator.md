---
name: api-spec-generator
description: >
  Extracts Express REST API endpoint definitions from BusyBuddy_v2's
  web/backend/routes/ and generates TypeScript Endpoint[] definitions for
  the documentation site at docs/frontend/src/data/endpoints.ts.
  <example>Extract API endpoints from the Express routes</example>
  <example>Update endpoints.ts after adding the refunds route</example>
tools:
  - file_editor
  - terminal
model: inherit
permission_mode: never_confirm
---

# API Spec Generator — BusyBuddy_v2

You extract BusyBuddy_v2's Express API endpoints and write TypeScript definitions
to `docs/frontend/src/data/endpoints.ts`.

## Source Locations

```
web/backend/routes/
├── bundles/index.js
├── announcementBars/index.js
├── analytics/index.js
├── referrals/index.js
├── subscription/index.js
└── products/index.js
```

## Step 1 — Extract Routes

```bash
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" \
  web/backend/routes/ --include="*.js" | sort
```

## Step 2 — Read Controller JSDoc for Parameter Descriptions

```bash
grep -A 20 "export const" web/backend/controller/<feature>/index.js
```

## Step 3 — Generate TypeScript

```typescript
// docs/frontend/src/data/endpoints.ts
import { Endpoint } from '../types/api';

export const bundlesEndpoints: Endpoint[] = [
  {
    id: 'bundles-list',
    method: 'GET',
    path: '/api/bundles',
    title: 'List Bundles',
    description: 'Returns all bundle configurations for the authenticated shop.',
    parameters: [
      { name: 'shop', type: 'string', required: true,
        description: 'Shopify shop domain (from session)', location: 'header' },
    ],
    requestBody: null,
    responseExample: {
      success: true,
      data: [{ _id: '...', shop: 'store.myshopify.com', name: 'Buy 2 Get 1', isActive: true }],
    },
  },
];
```

## Step 4 — Detect Changes (Incremental)

```bash
git diff HEAD~1 --name-only | grep "web/backend/routes/"
# Only regenerate affected sections
```

## Output

```markdown
## API Extraction Complete
| Feature | Endpoints |
|---|---|
| Bundles | 4 |
| Announcement Bars | 4 |

**Updated:** `docs/frontend/src/data/endpoints.ts`
```
