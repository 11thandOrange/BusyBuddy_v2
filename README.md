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

## AI Agent Automation

BusyBuddy_v2 uses [OpenHands](https://app.all-hands.dev) agents to autonomously
implement GitHub Issues. Label any issue `ready-to-implement` and the pipeline
runs end-to-end.

### Autonomous Dev Pipeline

```
Issue labelled "ready-to-implement"
        ↓
  ticket-planner              reads issue, maps to codebase, writes implementation plan
        ↓
 busybuddy-implementer        creates branch, writes JS/React/Node code in web/
        ↓
shopify-extension-implementer implements Liquid/Function extension changes (if needed)
        ↓
       tester                 fills missing tests across all 3 Vitest suites
        ↓
   build-check                npm install + CI=true npm run build
        ↓
   ticket-manager             opens PR linked to the issue
        ↓
   pr-reviewer                self-reviews, posts inline comments, iterates (max 2×)
        ↓
   ci-monitor                 waits for GitHub Actions to go green (max 3 retries)
        ↓
 whatsapp-notifier            sends "PR #N is ready for your review" to your phone
```

The pipeline **never** merges to `main`, runs `shopify app deploy`, or modifies
production environment variables. The WhatsApp message is the handoff — you review and merge.

### One-Time Setup

**1. Register secrets in OpenHands → Settings → Secrets**

| Secret | Where to get it |
|--------|----------------|
| `DB_CONNECTION` | MongoDB Atlas → Connect |
| `SHOPIFY_API_KEY` | Shopify Partners → Apps → API credentials |
| `SHOPIFY_API_SECRET` | Same as above |
| `SHOPIFY_CLI_PARTNERS_TOKEN` | Shopify Partners → Personal profile → CLI tokens |
| `WHATSAPP_PHONE` | Your number, international format, no `+` (e.g. `447911123456`) |
| `WHATSAPP_API_KEY` | Message `+34 644 76 60 71` on WhatsApp: `I allow callmebot to send me messages` |

**2. Create the label**
```bash
gh label create "ready-to-implement" --color "0075ca" \
  --description "Queued for autonomous implementation"
```

**3. Activate the automation**

Already registered in OpenHands — ID `3cfefdb0-a1bc-4f26-bcc6-4136ff0fb4da`.
See `.agents/automations/autonomous-dev-pipeline.md` to re-register if needed.

### Trigger the Pipeline

```bash
gh issue edit <ISSUE_NUMBER> --add-label "ready-to-implement"
```

### Repo-Level Agents

| Agent | Description |
|-------|-------------|
| `ticket-planner` | Reads a GitHub Issue → implementation plan mapped to this codebase |
| `busybuddy-implementer` | Writes JS/JSX/Express/Mongoose code following project patterns |
| `shopify-extension-implementer` | Liquid blocks, storefront JS, cart-transformer Function logic |
| `tester` | All 3 Vitest suites with correct commands and working directories |
| `build-check` | Frontend build verification with correct `CI` flag handling |
| `pr-reviewer` | Shopify/JS-specific review — Polaris, async errors, Mongoose, no secrets |

### Repo-Level Skills

| Skill | Description |
|-------|-------------|
| `env-setup` | Writes `web/.env` from OpenHands secrets before any run command |
| `dev-server` | Full startup: install deps → write `.env` → `shopify app dev` |

### Shared User-Level (HeyItsChloe/.agents)

| Item | Description |
|------|-------------|
| `ticket-manager` agent | Generic GitHub Issues + PR management |
| `ci-monitor` skill | Polls `gh pr checks`, surfaces failure logs, retry cap |
| `whatsapp-notifier` skill | callmebot/Twilio WhatsApp sender |

### CI

`.github/workflows/node-ci.yml` runs on every PR targeting `main`:
- Installs all dependency trees (root, `web/`, `web/frontend/`, `extensions/cart-transformer/`)
- Runs all 3 Vitest suites
- Builds frontend with `CI=true`