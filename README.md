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

> ⚠️ **The OpenHands-based pipeline described below is retired.** BusyBuddy_v2
> now uses a GitHub Actions + Claude Code pipeline orchestrated from
> `HeyItsChloe/agent-ops` — see `.github/workflows/dev-pipeline.yml`. Label
> an issue `approach-ready` (plan) or `approved` (implement), or comment
> `@dev-agent plan` / `@dev-agent implement`, to trigger it. The section
> below is kept for historical reference only.

BusyBuddy_v2 used to use [OpenHands](https://app.all-hands.dev) agents to autonomously
implement GitHub Issues. Label any issue `ready-to-implement-legacy` (previously
`ready-to-implement`) and the old pipeline would run end-to-end — this trigger
is now retired.

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
 whatsapp-notifier            [REMOVED — retired with the rest of this pipeline]
```

The pipeline **never** merges to `main`, runs `shopify app deploy`, or modifies
production environment variables.

### One-Time Setup

**1. Register secrets in OpenHands → Settings → Secrets**

| Secret | Where to get it |
|--------|----------------|
| `DB_CONNECTION` | MongoDB Atlas → Connect |
| `SHOPIFY_API_KEY` | Shopify Partners → Apps → API credentials |
| `SHOPIFY_API_SECRET` | Same as above |
| `SHOPIFY_CLI_PARTNERS_TOKEN` | Shopify Partners → Personal profile → CLI tokens |
| ~~`WHATSAPP_PHONE`~~ | _Removed — whatsapp-notifier retired_ |
| ~~`WHATSAPP_API_KEY`~~ | _Removed — whatsapp-notifier retired_ |

**2. Create the label**
```bash
gh label create "ready-to-implement-legacy" --color "0075ca" \
  --description "[LEGACY] Formerly queued for OpenHands autonomous implementation"
```

**3. Activate the automation**

~~Already registered in OpenHands — ID `3cfefdb0-a1bc-4f26-bcc6-4136ff0fb4da`.~~
**Retired.** Disable/delete this registration on the OpenHands Cloud side.
See `.agents/automations/busybuddy-dev-pipeline.legacy.md` for historical reference only — do not re-register.

### Trigger the Pipeline (legacy — do not use)

```bash
gh issue edit <ISSUE_NUMBER> --add-label "ready-to-implement-legacy"
```

### Repo-Level Agents (legacy — retired, see `.agents/agents/*.legacy.md`)

| Agent | Description |
|-------|-------------|
| `ticket-planner` | Reads a GitHub Issue → implementation plan mapped to this codebase |
| `busybuddy-implementer` | Writes JS/JSX/Express/Mongoose code following project patterns |
| `shopify-extension-implementer` | Liquid blocks, storefront JS, cart-transformer Function logic |
| `tester` | All 3 Vitest suites with correct commands and working directories |
| `smoke-tester` | Playwright AC screenshots in real Chromium — commits proof to branch, posts to PR |
| `pr-reviewer` | Shopify/JS-specific review — Polaris, async errors, Mongoose, no secrets |

### Repo-Level Skills

| Skill | Description |
|-------|-------------|
| `env-setup` | Writes `web/.env` from OpenHands secrets before any run command |
| `dev-server` | Full startup: install deps → write `.env` → `shopify app dev` |
| `build-check` | Frontend build verification with correct `CI` flag handling |
| `playwright-smoke` | Install Playwright, run smoke tests, commit screenshots, post PR comment |

### Shared User-Level (HeyItsChloe/.agents)

| Item | Description |
|------|-------------|
| `ticket-manager` agent | Generic GitHub Issues + PR management |
| `ci-monitor` skill | Polls `gh pr checks`, surfaces failure logs, retry cap |
| ~~`whatsapp-notifier` skill~~ | ~~callmebot/Twilio WhatsApp sender~~ _(removed)_ |

### CI

`.github/workflows/ci.yml` runs on every PR targeting `main`:
- Installs all dependency trees (root, `web/`, `web/frontend/`, `extensions/cart-transformer/`)
- Runs all 3 Vitest suites
- Builds frontend with `CI=true`