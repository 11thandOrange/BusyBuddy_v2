# Dev Server Skill — BusyBuddy_v2

Starts the full BusyBuddy_v2 app in development mode using `shopify app dev`.
This handles both the backend (Express + MongoDB) and frontend (Vite) in a single
command, and creates a Shopify tunnel automatically.

## Prerequisites

- `env-setup` skill has been run (web/.env exists with valid secrets)
- OpenHands secrets registered: `DB_CONNECTION`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_CLI_PARTNERS_TOKEN`

## Full Startup Sequence

### Step 1 — Install All Dependencies

```bash
# From repo root
npm install                    # installs @shopify/cli
cd web && npm install          # backend deps
cd web/frontend && npm install # frontend deps
cd extensions/cart-transformer && npm install  # extension deps
cd /repo                       # back to root
```

### Step 2 — Write Environment File

Follow `env-setup.md` to write `web/.env`.

### Step 3 — Start the App

```bash
# From repo root — uses SHOPIFY_CLI_PARTNERS_TOKEN for non-interactive auth
SHOPIFY_CLI_PARTNERS_TOKEN=$SHOPIFY_CLI_PARTNERS_TOKEN shopify app dev 2>&1 &
APP_PID=$!
echo "App started with PID $APP_PID"
```

`shopify app dev` will:
1. Start the Express backend on `BACKEND_PORT` (default 3000)
2. Start the Vite frontend dev server on `FRONTEND_PORT`
3. Create a Shopify tunnel (public HTTPS URL)
4. Print the tunnel URL in the logs

### Step 4 — Capture the Tunnel URL

```bash
# Wait for the tunnel URL to appear in logs
sleep 15
# The URL appears in output as: https://<random>.trycloudflare.com
# Or check the Shopify Partners dashboard for the dev store preview URL
```

### Step 5 — Verify the Backend is Up

```bash
sleep 5
curl -s http://localhost:3000/api/test
# Expected: Hello world
```

### Step 6 — Verify MongoDB Connected

Check the process output for:
```
mongodb successfully connected***********************************
```

If you see `mongodb failed to connect`, check the `DB_CONNECTION` secret.

## Running Backend Only (no Shopify tunnel)

For testing backend routes without the full Shopify CLI flow:

```bash
# Write .env first (see env-setup.md)
cd web && npm run dev &
sleep 5
curl -s http://localhost:3000/api/test  # → Hello world
```

This starts Express with nodemon (auto-reloads on changes). The Shopify auth
middleware will reject requests without a valid session, but the `/api/test`
endpoint and any non-authenticated routes will work.

## Stopping the App

```bash
# Stop by PID
kill $APP_PID

# Or find and kill
ps aux | grep "shopify app dev" | grep -v grep | awk '{print $2}' | xargs kill
ps aux | grep "node index.js" | grep -v grep | awk '{print $2}' | xargs kill
```

## Ports

| Service | Port | Env var |
|---------|------|---------|
| Backend (Express) | 3000 | `BACKEND_PORT` |
| Frontend (Vite) | Assigned by CLI | `FRONTEND_PORT` |
| Shopify tunnel | 443 (HTTPS) | N/A — CLI handles it |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `mongodb failed to connect` | Check `DB_CONNECTION` in `web/.env` — Atlas must allow connections from any IP (0.0.0.0/0) or the sandbox IP |
| `You need to be logged in` | Ensure `SHOPIFY_CLI_PARTNERS_TOKEN` is set and valid |
| `EADDRINUSE: port 3000` | Something else is using port 3000 — `kill $(lsof -ti:3000)` |
| Vite build error on start | Set `CI=true` in the env or provide `SHOPIFY_API_KEY` |
| Tunnel URL not appearing | Wait longer (20–30s) or check `shopify app dev` output for errors |
