# BusyBuddy - Postman Collection

Postman collection and environment for BusyBuddy_v2: the storefront-facing
Front Store API and the shared Agent Ops email pipeline.

## Files

- `BusyBuddy.postman_collection.json` - the collection (two folders, see below)
- `BusyBuddy.postman_environment.json` - environment variables

> The older `OpenHands_*.postman_*.json` files in this folder belong to a
> separate, unrelated OpenHands automations collection and are being retired
> on their own branch (#325). This BusyBuddy collection is independent of them.

## Import

1. Open Postman -> **Import**.
2. Select both `BusyBuddy.postman_collection.json` and
   `BusyBuddy.postman_environment.json`.
3. In the top-right environment selector, choose **BusyBuddy**.

## Variables

Set these on the **BusyBuddy** environment (Environments -> BusyBuddy):

| Variable          | Example                                   | Used by            | Notes                                                        |
|-------------------|-------------------------------------------|--------------------|--------------------------------------------------------------|
| `baseUrl`         | `https://your-busybuddy-host.example.com` | Front Store API    | Root of the deployed BusyBuddy app (no trailing slash).      |
| `shop`            | `your-store.myshopify.com`                | Front Store API    | The myshopify domain the request is for.                     |
| `orchestratorUrl` | `https://your-orchestrator.example.com`   | Email pipeline     | Base URL of the shared Agent Ops orchestrator (no `/email`). |
| `sharedSecret`    | *(empty - paste your secret)*             | Email pipeline     | Orchestrator shared secret. Marked **secret**; never commit. |

No secrets are hardcoded in the collection or environment - `sharedSecret`
ships empty and must be filled in locally.

## Auth per folder

### Front Store API (`{{baseUrl}}/api/frontStore/*`)

These endpoints are served to storefront visitors through a **Shopify App
Proxy**. Shopify appends `shop`, `signature`, `timestamp`, and related params
to every request and signs them; the app verifies the request with
HMAC-SHA256 over all sorted `key=value` query params (excluding `signature`),
keyed by `SHOPIFY_API_SECRET` (`web/middleware/verify-signature.js`).

Postman cannot mint a valid Shopify App Proxy signature, so the `signature`
query param in each request is a placeholder. Against a live server these
requests return `401 { message: "Invalid request signature..." }` unless you
paste in a real `shop`/`signature` pair captured from an actual proxied
request. They are included as accurate documentation of method, path, params,
and body shape.

Endpoints (all `GET` except subscribe; all behind `requireSubscriptionAccess`):

| Method | Path                                  | Purpose                                             |
|--------|---------------------------------------|-----------------------------------------------------|
| GET    | `/api/frontStore/getActiveBundle`     | Active bundle for a `product_id`, enriched.         |
| GET    | `/api/frontStore/getInactiveTab`      | Inactive browser-tab message content.               |
| GET    | `/api/frontStore/getAnnouncementBar`  | Active announcement bar for the shop.               |
| POST   | `/api/frontStore/subscribe`           | Capture a visitor email to the shop's email list.   |

### Email (shared pipeline) (`{{orchestratorUrl}}/email`)

Calls the shared Agent Ops orchestrator directly. Auth is the orchestrator
shared secret, sent as the **`X-Shared-Secret`** header with value
`{{sharedSecret}}`. This is the same pipeline BusyBuddy reaches from CI via
`.github/workflows/email.yml` -> agent-ops `email-reusable.yml`.

`POST {{orchestratorUrl}}/email` body fields:

- `provider` - `gmail` | `mailchimp`
- `to` - single address or an array / comma-separated list
- `subject` - subject line (omit when a template supplies its own)
- `text` and/or `html` - direct content mode
- `template` + `template_vars` - named-template mode (instead of text/html)

Example cases in the folder: Gmail single, Gmail multi, Mailchimp single,
Mailchimp template, direct body (text+html), invalid request (`400`), and
auth failure (`401`).
