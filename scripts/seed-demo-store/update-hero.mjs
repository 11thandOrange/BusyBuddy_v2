#!/usr/bin/env node
// Uploads a hero banner photo (via Unsplash Search API) to the store's file
// library, then sets it as the homepage hero section's image_1/image_2 in
// templates/index.json.
//
// Requires UNSPLASH_ACCESS_KEY, SHOPIFY_STORE_DOMAIN, and either
// SHOPIFY_ADMIN_TOKEN or SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET.
//
// Usage: node scripts/seed-demo-store/update-hero.mjs

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const API_VERSION = "2025-10";
const HERO_QUERY = "vintage electronics store display flat lay";

if (!STORE_DOMAIN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN environment variable.");
  process.exit(1);
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY environment variable.");
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

let ACCESS_TOKEN;

async function shopifyGraphql(query, variables) {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function restGet(path) {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/${path}`, {
    headers: { "X-Shopify-Access-Token": ACCESS_TOKEN },
  });
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}


async function findHeroImageUrl() {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(HERO_QUERY)}&per_page=1&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) throw new Error(`Unsplash search HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const first = json.results?.[0];
  if (!first) throw new Error(`No Unsplash results for "${HERO_QUERY}"`);

  const wideUrl = new URL(first.urls.raw);
  wideUrl.searchParams.set("fit", "crop");
  wideUrl.searchParams.set("crop", "entropy");
  wideUrl.searchParams.set("w", "2400");
  wideUrl.searchParams.set("h", "1000");
  wideUrl.searchParams.set("q", "80");
  return wideUrl.toString();
}

const FILE_CREATE_MUTATION = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        ... on MediaImage {
          image { url }
        }
      }
      userErrors { field message }
    }
  }
`;

const FILE_QUERY = `
  query getFile($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        fileStatus
        image { url }
      }
    }
  }
`;

const THEME_FILES_UPSERT_MUTATION = `
  mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $themeId, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message }
    }
  }
`;

async function uploadHeroImage(sourceUrl) {
  const data = await shopifyGraphql(FILE_CREATE_MUTATION, {
    files: [{ originalSource: sourceUrl, contentType: "IMAGE" }],
  });
  if (data.fileCreate.userErrors.length > 0) {
    throw new Error(`fileCreate errors: ${JSON.stringify(data.fileCreate.userErrors)}`);
  }
  const file = data.fileCreate.files[0];

  let status = file.fileStatus;
  let imageUrl = file.image?.url;
  for (let i = 0; i < 15 && status !== "READY"; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const check = await shopifyGraphql(FILE_QUERY, { id: file.id });
    status = check.node.fileStatus;
    imageUrl = check.node.image?.url;
  }
  if (status !== "READY") throw new Error(`File never became READY (last status: ${status})`);
  return imageUrl;
}

async function main() {
  ACCESS_TOKEN = await getAccessToken();

  const sourceUrl = await findHeroImageUrl();
  console.log(`Hero source image: ${sourceUrl}`);

  const uploadedUrl = await uploadHeroImage(sourceUrl);
  console.log(`Uploaded to file library: ${uploadedUrl}`);

  const filename = new URL(uploadedUrl).pathname.split("/").pop();
  const shopImageRef = `shopify://shop_images/${filename}`;
  console.log(`Shop image reference: ${shopImageRef}`);

  const { themes } = await restGet("themes.json");
  const mainTheme = themes.find((t) => t.role === "main");
  if (!mainTheme) throw new Error("No main/published theme found.");

  const { asset } = await restGet(
    `themes/${mainTheme.id}/assets.json?asset[key]=templates/index.json`
  );
  const template = JSON.parse(asset.value);

  const heroSectionId = Object.keys(template.sections).find(
    (id) => template.sections[id].type === "hero"
  );
  if (!heroSectionId) throw new Error("No hero section found in templates/index.json");

  template.sections[heroSectionId].settings.image_1 = shopImageRef;
  template.sections[heroSectionId].settings.image_2 = shopImageRef;

  const themeGid = `gid://shopify/OnlineStoreTheme/${mainTheme.id}`;
  const upsertData = await shopifyGraphql(THEME_FILES_UPSERT_MUTATION, {
    themeId: themeGid,
    files: [
      {
        filename: "templates/index.json",
        body: { type: "TEXT", value: JSON.stringify(template, null, 2) },
      },
    ],
  });
  if (upsertData.themeFilesUpsert.userErrors.length > 0) {
    throw new Error(
      `themeFilesUpsert errors: ${JSON.stringify(upsertData.themeFilesUpsert.userErrors)}`
    );
  }

  console.log(`\nUpdated hero section "${heroSectionId}" with new image.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
