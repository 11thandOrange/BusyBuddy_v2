#!/usr/bin/env node
// Diagnostic: finds the published theme, then prints the homepage template's
// section structure so we can identify the hero/image-banner section's
// settings key before attempting to edit it.
//
// Usage: node scripts/seed-demo-store/inspect-theme.mjs

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const API_VERSION = "2025-10";

if (!STORE_DOMAIN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN environment variable.");
  process.exit(1);
}

async function getAccessToken() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) {
    return process.env.SHOPIFY_ADMIN_TOKEN;
  }
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const { access_token } = await res.json();
  return access_token;
}

async function restGet(token, path) {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/${path}`, {
    headers: { "X-Shopify-Access-Token": token },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} -> HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const token = await getAccessToken();

  const { themes } = await restGet(token, "themes.json");
  const mainTheme = themes.find((t) => t.role === "main");
  if (!mainTheme) throw new Error("No main/published theme found.");
  console.log(`Main theme: ${mainTheme.name} (id=${mainTheme.id})`);

  const { asset: indexTemplate } = await restGet(
    token,
    `themes/${mainTheme.id}/assets.json?asset[key]=templates/index.json`
  );
  console.log("\n--- templates/index.json ---");
  console.log(indexTemplate.value);

  const { asset: settingsData } = await restGet(
    token,
    `themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`
  );
  const settingsParsed = JSON.parse(settingsData.value);
  const currentSections = settingsParsed.current?.sections || {};
  const heroLike = Object.entries(currentSections).filter(([, s]) =>
    /banner|hero|image/i.test(s.type || "")
  );
  console.log(`\n--- config/settings_data.json: ${Object.keys(currentSections).length} sections total, image/banner/hero-like: ---`);
  console.log(JSON.stringify(Object.fromEntries(heroLike), null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
