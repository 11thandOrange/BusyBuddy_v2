---
title: "Email Provider"
order: 10
summary: "The shared email-provider integration: connects a merchant's ESP (Mailchimp, Klaviyo, SendGrid, or MailerLite) and exposes one caller that other features use to subscribe storefront visitors and send templated email."
status: stable
implements:
  workflows:
    - ci
  skills: []
  dependencies: []
  integrations:
    - shopify-admin-api
runWith:
  - "Connect an ESP with an API key via POST /api/email-provider/connect; read the current settings via GET /api/email-provider."
  - "Pull the account's lists and templates with POST /api/email-provider/sync, then read them via GET /api/email-provider/lists and /templates."
  - "Storefront email capture (e.g. announcement-bar email + inactive-tab) flows through the shared EmailService adapter to the connected provider."
tradeoffs:
  - "One provider is connected per shop at a time (the emailProvider model's `provider` enum is mailchimp/klaviyo/sendgrid/mailerlite/none); switching providers replaces the connection."
  - "EmailService is the single adapter layer for all outbound email; each provider implements the same adapter interface, so callers do not special-case the ESP."
notes:
  - kind: note
    body: "web/backend/services/emailService.js is the shared caller — an adapter-per-provider abstraction. merchantEmailService.js (lifecycle emails to merchants) and the frontStore subscribe endpoint both go through this layer."
---

## What it does

Email Provider is BusyBuddy's shared email integration. A merchant connects one email service
provider (ESP) — Mailchimp, Klaviyo, SendGrid, or MailerLite — and the rest of the app uses a
single caller to subscribe storefront visitors to a list and to send templated email, without
each feature knowing which ESP is configured.

## How it works

The frontend surface lives with the widgets that capture email (for example
`web/frontend/apps/announcement-bar/components/EmailIntegration.jsx` and `EmailBarSettings.jsx`).
The backend routes live under `web/backend/routes/emailProvider/` and are mounted at
`/api/email-provider`:

- `POST /connect`, `GET /`, `DELETE /` — connect, read, and disconnect the provider
- `POST /sync` — pull lists and templates from the ESP
- `GET /lists`, `GET /templates` — read the synced lists and templates
- `PUT /default-list` — set the default subscribe list

Connection state persists to the `EmailProvider` Mongoose model (provider enum, API key, lists,
templates, default list). The shared caller is `web/backend/services/emailService.js`, an
adapter-per-provider layer (`EmailProviderAdapter` base plus one adapter per ESP). Sends and
subscribes — including the app-proxy `POST /api/frontStore/subscribe` endpoint and the
merchant-lifecycle emails in `merchantEmailService.js` — route through this layer, and outbound
sends are recorded in the `EmailLog` model.

## Configuration & running

A merchant connects their ESP with an API key, syncs lists and templates, and picks a default
list. From then on, any BusyBuddy feature that captures or sends email calls the shared
`EmailService`, which dispatches to whichever provider the shop connected.
