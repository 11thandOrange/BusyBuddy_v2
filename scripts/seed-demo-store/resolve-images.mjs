#!/usr/bin/env node
// One-off repair tool: fetches each Unsplash *page* URL (not the guessed CDN
// URL) and extracts the real image URL from the page's og:image meta tag.
// Run in an environment with real internet access (this sandbox's egress
// policy blocks unsplash.com directly, hence resolving via GH Actions).
//
// Usage: node scripts/seed-demo-store/resolve-images.mjs

const PAGES = {
  "original-ipod": "https://unsplash.com/photos/silver-mp3-player-with-headphone-jack-and-cable-q6r8QCz-AsU",
  "ipod-mini": "https://unsplash.com/photos/9RnWctg6glg",
  "ipod-classic": "https://unsplash.com/photos/turned-on-white-ipod-classic-JMvfuYiMlJo",
  "ipod-nano": "https://unsplash.com/photos/blue-ipod-nano-6-th-generation-t8T2uRD9kr4",
  "iphone-2g": "https://unsplash.com/photos/black-smartphone-cmH5HxYwRRU",
  "iphone-3gs": "https://unsplash.com/photos/black-smartphone-gwWkv06WYFY",
  "motorola-razr": "https://unsplash.com/photos/eqTdTtFyABU",
  "nokia-3310": "https://unsplash.com/photos/black-nokia-candybar-phone-F5V6d7nPsLQ",
  "sony-walkman": "https://unsplash.com/photos/a-cassette-player-with-headphones-on-a-pink-background-wkoyRmgyshI",
  "nintendo-game-boy": "https://unsplash.com/photos/person-holding-gray-nintendo-game-boy-_2Tsx2c8fPg",
  "game-boy-color": "https://unsplash.com/photos/pink-retro-handheld-game-console-with-buttons-0VzHTcb0d6k",
  "nintendo-ds": "https://unsplash.com/photos/a-lime-green-nintendo-ds-is-displayed-open-1Wdm7h-CTTs",
  "blackberry-bold": "https://unsplash.com/photos/G2ajyakMu7E",
  "blackberry-curve": "https://unsplash.com/photos/a-person-holding-a-smart-phone-in-their-hand-K-xqKittwlQ",
  "sony-psp": "https://unsplash.com/photos/a-handheld-gaming-console-with-a-bright-screen-uIVZ1-gQFn0",
  "sega-game-gear": "https://unsplash.com/photos/six-handheld-game-consoles-QstVhKiQndg",
  "flip-video-camera": "https://unsplash.com/photos/man-holding-camcorder-oIaNUpzk434",
  "minidv-camcorder": "https://unsplash.com/photos/eL1dOa2PKQs",
  "crt-television": "https://unsplash.com/photos/turned-off-gray-crt-tv-on-table-U8kNV-0dCS0",
  "polaroid-instant-camera": "https://unsplash.com/photos/white-and-black-polaroid-instant-camera-HnIBeVbVZjA",
};

async function resolveOne(handle, pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) {
      console.log(`${handle} | HTTP_ERROR ${res.status} | ${pageUrl}`);
      return;
    }
    const html = await res.text();
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!match) {
      console.log(`${handle} | NO_OG_IMAGE | ${pageUrl}`);
      return;
    }
    console.log(`${handle} | ${match[1]}`);
  } catch (err) {
    console.log(`${handle} | FETCH_FAILED ${err.message} | ${pageUrl}`);
  }
}

async function main() {
  for (const [handle, pageUrl] of Object.entries(PAGES)) {
    await resolveOne(handle, pageUrl);
  }
}

main();
