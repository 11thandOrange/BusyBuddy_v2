# BusyBuddy_v2

A Shopify app that provides bundle discounts, BOGO offers, announcement bars,
volume discounts, mix-and-match deals, and inactive tab messaging for merchants.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Frontend | React, Vite, Shopify Polaris |
| Extensions | Shopify Theme Extension (Liquid), Cart Transformer Function |
| Tests | Vitest (backend + frontend + extension) |
| Deploy | Shopify CLI, Docker |

## Project Structure

```
web/
├── index.js                      # Express entry point
├── backend/
│   ├── controller/<feature>/     # Async req/res handlers
│   ├── models/<feature>.model.js # Mongoose schemas
│   ├── routes/<feature>/         # Express routers
│   └── services/                 # Shared business logic
└── frontend/
    ├── pages/                    # React Router pages
    ├── apps/<feature>/           # Per-feature modules (Form, Actions, Reducers)
    └── components/               # Shared UI (Analytics, Modals, Plans)

extensions/
├── bogo-shopify-app/             # Theme extension — Liquid blocks + JS assets
└── cart-transformer/             # Shopify Function — server-side cart logic
```

## Development

### Prerequisites

- Node.js 22+
- MongoDB Atlas account (or local MongoDB)
- Shopify Partners account + dev store
- Shopify CLI (`npm install -g @shopify/cli`)

### Environment Setup

Create `web/.env`:
```
DB_CONNECTION=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
DB_NAME=bogo-app
```

Shopify credentials are injected automatically by `shopify app dev`.

### Run

```bash
npm install
shopify app dev
```

### Test

```bash
# Backend
cd web && npm test

# Frontend
cd web/frontend && npm test

# Cart transformer extension
cd extensions/cart-transformer && npm test
```

### Build

```bash
cd web/frontend && CI=true npm run build
```

> `CI=true` bypasses the `SHOPIFY_API_KEY` build-time check for local verification.
> The full app still requires credentials at runtime.

---

## Dev Pipeline Automation

BusyBuddy_v2 uses a GitHub Actions + Claude Code dev pipeline: `.github/workflows/dev-pipeline.yml` calls the reusable workflow in `HeyItsChloe/pipeline-orchestrator` (dev skills sourced from `11thandOrange/agent-ops`). Trigger it by labeling an issue `approach-ready` (plan) or `approved` (implement), or commenting `@dev-agent plan` / `@dev-agent implement`.
