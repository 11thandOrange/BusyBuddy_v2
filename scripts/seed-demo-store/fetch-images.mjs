#!/usr/bin/env node
// Uses the official Unsplash Search Photos API (not scraping) to find one
// image per product and writes the verified URLs into images.json.
//
// Requires UNSPLASH_ACCESS_KEY env var.
//
// Usage: node scripts/seed-demo-store/fetch-images.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY environment variable.");
  process.exit(1);
}

// Generic/category search terms - avoids searching brand names directly so
// results skew toward generic product photography rather than official shots.
const QUERIES = {
  "vintage-macintosh-laptop": "vintage laptop computer",
  "imac-g3": "colorful retro desktop computer",
  "original-ipod": "silver mp3 player",
  "ipod-mini": "portable music player clip",
  "ipod-classic": "handheld music player",
  "ipod-nano": "small clip music player",
  "iphone-2g": "black touchscreen smartphone",
  "iphone-3gs": "black smartphone",
  "motorola-razr": "silver flip phone",
  "nokia-3310": "retro mobile phone",
  "sony-walkman": "cassette player headphones",
  "sony-discman": "portable cd player",
  "tamagotchi": "digital pet toy keychain",
  "nintendo-game-boy": "handheld game console grey",
  "game-boy-color": "colorful handheld game console",
  "nintendo-ds": "dual screen handheld console",
  "palm-pilot": "pda organizer stylus",
  "blackberry-bold": "smartphone physical keyboard",
  "blackberry-curve": "smartphone qwerty keyboard",
  "sony-psp": "handheld gaming console widescreen",
  "sega-game-gear": "retro handheld game console",
  "flip-video-camera": "pocket video camera",
  "minidv-camcorder": "camcorder flip screen",
  "crt-television": "old crt television",
  "polaroid-instant-camera": "instant film camera",
};

async function searchOne(handle, query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });
  if (!res.ok) {
    console.error(`${handle}: HTTP ${res.status} - ${await res.text()}`);
    return null;
  }
  const json = await res.json();
  const first = json.results?.[0];
  if (!first) {
    console.warn(`${handle}: no results for "${query}"`);
    return null;
  }

  // Build a uniform square crop (Shopify's recommended product image size)
  // from the raw asset instead of Unsplash's default arbitrary-aspect thumbnail.
  const squareUrl = new URL(first.urls.raw);
  squareUrl.searchParams.set("fit", "crop");
  squareUrl.searchParams.set("crop", "entropy");
  squareUrl.searchParams.set("w", "2048");
  squareUrl.searchParams.set("h", "2048");
  squareUrl.searchParams.set("q", "80");

  console.log(`${handle}: ${squareUrl.toString()}`);
  return squareUrl.toString();
}

async function main() {
  const imagesPath = path.join(__dirname, "images.json");
  const images = JSON.parse(await readFile(imagesPath, "utf-8"));

  for (const [handle, query] of Object.entries(QUERIES)) {
    const url = await searchOne(handle, query);
    images[handle] = url ? [url] : [];
    // Unsplash rate limit is generous for search but be polite anyway.
    await new Promise((r) => setTimeout(r, 250));
  }

  await writeFile(imagesPath, JSON.stringify(images, null, 2) + "\n");
  console.log("\nUpdated images.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
