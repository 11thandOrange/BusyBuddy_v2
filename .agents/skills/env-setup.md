# Env Setup Skill — BusyBuddy_v2

Writes `web/.env` from the dev pipeline's environment secrets before running or testing the app.
Run this before `dev-server` or any command that needs a live database connection.

## Required Secrets

These are provided by the dev pipeline environment (GitHub Actions secrets):

| Secret | Description |
|--------|-------------|
| `DB_CONNECTION` | MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`) |
| `SHOPIFY_API_KEY` | From Shopify Partners → Apps → your app → API credentials |
| `SHOPIFY_API_SECRET` | Same location as API key |
| `SHOPIFY_CLI_PARTNERS_TOKEN` | Shopify Partners → Personal profile → CLI tokens (for non-interactive auth) |

`DB_NAME` defaults to `bogo-app` and is hardcoded below.

## Write the .env File

```bash
# Run from repo root
cat > web/.env << ENVEOF
DB_CONNECTION=${DB_CONNECTION}
DB_NAME=bogo-app
SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET}
SHOPIFY_CLI_PARTNERS_TOKEN=${SHOPIFY_CLI_PARTNERS_TOKEN}
ENVEOF

echo "web/.env written"
cat web/.env | sed 's/=.*/=<hidden>/'   # confirm keys without exposing values
```

## Verify MongoDB Reachability

```bash
node -e "
import('mongoose').then(({ default: mongoose }) => {
  mongoose.connect(process.env.DB_CONNECTION || '$(grep DB_CONNECTION web/.env | cut -d= -f2)')
    .then(() => { console.log('MongoDB connected'); process.exit(0); })
    .catch(e => { console.error('MongoDB failed:', e.message); process.exit(1); });
});
"
```

Or simply start the backend and check the log:
```bash
cd web && node index.js &
sleep 3 && curl -s http://localhost:3000/api/test
# Should return: Hello world
```

## Cleanup

`.env` is listed in `.gitignore`. Never commit it.

```bash
# Confirm it's ignored
git check-ignore -v web/.env
# Expected: web/.gitignore:1:*.env   web/.env
```
