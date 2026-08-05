// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import morgan from "morgan";
import router from "./backend/routes/index.js";
import webhookRoutes from "./backend/routes/webhooks/index.js";
import referralRoutes from "./backend/routes/referrals/index.js";
import conditional from "express-conditional-middleware";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import shopData from "./middleware/shopData.js";
import { verifySHA256, generateSignature, verifyShopSignature } from "./middleware/verify-signature.js";
import { verifyShopifyWebhook } from "./middleware/verifyWebhook.js";
import { subscriptionUpdate } from "./backend/services/subscription.js"
import logger, { reportError } from "./logger.js";
dotenv.config();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

// A crash mid-request leaves the process in an undefined state (Node docs
// recommend exiting rather than continuing); an unhandled rejection is
// usually recoverable but must not vanish silently.
process.on("unhandledRejection", (reason) => {
  reportError(reason, { type: "unhandledRejection" });
});

process.on("uncaughtException", (error) => {
  reportError(error, { type: "uncaughtException" });
  process.exit(1);
});

const STATIC_PATH =
  process.env.NODE_ENV === "production" ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`;

// Name+path only, no querystring parsing needed for this narrow use - avoids
// adding cookie-parser as a dependency just to read one value back.
const EDITOR_RETURN_TO_COOKIE = "bb_editor_return_to";
const getCookie = (req, name) => {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const prefix = `${name}=`;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return undefined;
};

const app = express();
// a route to test the server
app.get("/api/test", (req, res) => {
  res.status(200).send("Hello world");
});

let db = process.env.DB_CONNECTION || "";
// mongodb setup
mongoose.set("strictQuery", true);
mongoose.connect(db).then(
  function (value) {
    logger.info("mongodb successfully connected");
  },
  function (error) {
    reportError(error, { context: "mongodb connection" });
  }
);
app.use(morgan("tiny"));

// ============================================
// WEBHOOK ROUTES - must be registered before any global body-parser
// ============================================
// shopify.processWebhooks() and the verify-signature json() below both need
// the untouched raw request stream to verify Shopify's HMAC signature and
// (for processWebhooks) to parse the body themselves. If a global
// express.json() ran first, it would drain the stream before either of
// these ever sees it - processWebhooks would fail with "No body was
// received when processing webhook", and the HMAC check below would fall
// back to a re-serialized body that doesn't match what Shopify signed.
// These two blocks must stay registered ahead of the global express.json()
// further down.
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }));

// Webhook routes - mounted BEFORE authenticated routes
// These endpoints receive events from Shopify and internal services without session auth
app.use(
  "/api/webhooks",
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for HMAC verification
      req.rawBody = buf.toString();
    },
  }),
  verifyShopifyWebhook,
  webhookRoutes
);

// ============================================
// PUBLIC ROUTES - No Shopify authentication required
// These must be registered BEFORE the Shopify auth middleware
// ============================================
app.use(express.json());
app.use("/api/referrals", referralRoutes);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopData.shopData,
  // shopify.redirectToShopifyOrAppRoot() always lands the merchant on this
  // app's embedded home, with no way to know a request came from the
  // standalone editor tab instead of the normal embedded app. When the
  // editor route below sends someone through this flow (no/expired session)
  // it drops a short-lived cookie naming where they actually came from;
  // honor it here instead of falling through to the default root redirect,
  // so re-authenticating from the editor sends them back to the editor
  // instead of bouncing them into the Shopify admin iframe.
  (req, res, next) => {
    const returnTo = getCookie(req, EDITOR_RETURN_TO_COOKIE);
    if (returnTo && returnTo.startsWith("/editor.html")) {
      res.clearCookie(EDITOR_RETURN_TO_COOKIE, { path: "/" });
      return res.redirect(returnTo);
    }
    next();
  },
  shopify.redirectToShopifyOrAppRoot()
);

// Google OAuth callback - must be BEFORE Shopify auth middleware
// since Google redirects directly to this URL without Shopify credentials
// Using dynamic import to avoid loading googleapis at startup
app.get("/api/analytics/google/callback", async (req, res) => {
  const { handleGoogleCallback } = await import("./backend/controller/googleAnalytics/index.js");
  return handleGoogleCallback(req, res);
});

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// ============================================
// AUTHENTICATED ROUTES - Require Shopify shop session
// ============================================
// app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(
  "/api/*",
  conditional(
    (_req, res, next) => {
      return Boolean(_req.query.shop);
    },
    async (_req, res, next) => {
      // @ts-ignore
      var shop = _req.query.shop.toString();
      const isValid = verifyShopSignature(shop, _req.query.signature);
      if (!isValid) {
        return res.status(401).send("Unauthorized");
      }
      const sessionId = await shopify.api.session.getOfflineId(shop);
      const session = await shopify.config.sessionStorage.loadSession(sessionId);
      if (!session) {
        return res.status(401).send("Unauthorized");
      }
      res.locals.shopify = {
        session,
        shopOrigin: shop,
        accessToken: session.accessToken,
      };
      return next();
    },
    (...args) => {
      return shopify.validateAuthenticatedSession()(...args);
    }
  )
);

// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);

//   res.status(200).send({ count: countData.data.productsCount.count });
// });

app.use(shopify.cspHeaders());
app.use("/api", router);

app.use("/", async (_req, res, _next) => {
  // Shopify redirects here with charge_id+shop after a billing confirmation.
  // Only trust it enough to trigger a resync if the request carries a valid
  // Shopify HMAC signature - otherwise an arbitrary caller could force a
  // resync for any shop=<value> they choose.
  if (_req.query.charge_id && _req.query.shop && verifySHA256(_req)) {
    const shop = _req.query.shop.toString();
    const sessionId = await shopify.api.session.getOfflineId(shop);
    const session = await shopify.config.sessionStorage.loadSession(sessionId);
    if (session) {
      subscriptionUpdate(session);
    }
  }
  _next();
});

// Helper function to serve the main frontend HTML (with App Bridge)
const serveFrontendHtml = (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
};

// Helper function to serve the editor HTML (without App Bridge)
// Injects a shop+signature pair (see verify-signature.js's generateSignature)
// so the editor's own /api/* calls - which have no App Bridge session token
// to authenticate with - can use the shop+signature path that web/index.js's
// /api/* middleware already supports but nothing was previously feeding.
const serveEditorHtml = (_req, res, shop, signature) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "editor.html"))
        .toString()
        .replace("%EDITOR_SHOP%", shop || "")
        .replace("%EDITOR_SIGNATURE%", signature || "")
    );
};

// Editor routes opened in new tab - validate shop session from DB.
// This allows editor to work in standalone tab without Shopify embedded
// context. MUST run before the static file server below: the Vite build
// outputs a real editor.html onto disk, so serve-static would otherwise
// serve that raw file directly (skipping session validation *and* the
// %EDITOR_SHOP%/%EDITOR_SIGNATURE% substitution below) for any request
// that reaches it first - which prior to this comment is exactly what was
// happening, silently, regardless of what this block below did.
app.use("/*", async (_req, res, _next) => {
  const fullPath = _req.originalUrl || _req.url;
  // Exact match (not a substring check) so this never accidentally catches
  // a built asset whose filename happens to contain "editor" (e.g. Vite's
  // /assets/editor-<hash>.js chunk for this same entry point).
  const isEditorRoute = fullPath === '/editor.html' || fullPath.startsWith('/editor.html?');
  const shop = _req.query.shop;

  if (isEditorRoute && shop) {
    try {
      // Look up the session through shopify.config.sessionStorage - the
      // exact same store shopify.ensureInstalledOnShop() below (and the
      // /api/* middleware above) already use successfully for the main
      // embedded app. The old code queried a separate Mongoose model
      // (sessionModel) pointed at mongoose.connect(DB_CONNECTION), while
      // this storage is a raw mongodb client scoped to DB_NAME explicitly -
      // two different connections that can silently diverge (e.g. no db
      // name in DB_CONNECTION defaulting to a different database than
      // DB_NAME), which is exactly what made this always report "no
      // session" for shops the main app was otherwise working fine on.
      const sessionId = await shopify.api.session.getOfflineId(shop);
      const session = await shopify.config.sessionStorage.loadSession(sessionId);

      if (session && session.accessToken) {
        // Valid session exists - serve the editor HTML (no App Bridge)
        const signature = generateSignature({ shop });
        return serveEditorHtml(_req, res, shop, signature);
      }

      // No valid session for this shop (never installed, or the session
      // expired/was revoked) - previously this fell through to _next(),
      // which serve-static would answer with the raw editor.html straight
      // off disk: %EDITOR_SHOP%/%EDITOR_SIGNATURE% never get substituted,
      // so every /api/* call the editor makes is signed with the literal
      // placeholder text and fails auth with a confusing 401 deep in a
      // product/save request instead of a clear "please reinstall" signal.
      // Send the merchant through OAuth instead, same as the embedded app
      // would for an unauthenticated shop. Remember this tab was on the
      // editor (see EDITOR_RETURN_TO_COOKIE above) so the callback can send
      // them back here instead of the app's embedded home.
      console.log(`Editor route requested for ${shop} with no valid session - redirecting to OAuth`);
      res.cookie(EDITOR_RETURN_TO_COOKIE, fullPath, { maxAge: 5 * 60 * 1000, httpOnly: true, sameSite: "lax", path: "/" });
      return res.redirect(`${shopify.config.auth.path}?shop=${encodeURIComponent(shop)}`);
    } catch (error) {
      console.log("Editor session error:", error.message);
      res.cookie(EDITOR_RETURN_TO_COOKIE, fullPath, { maxAge: 5 * 60 * 1000, httpOnly: true, sameSite: "lax", path: "/" });
      return res.redirect(`${shopify.config.auth.path}?shop=${encodeURIComponent(shop)}`);
    }
  }

  _next();
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), serveFrontendHtml);

// Centralized error handler - must be registered last and take 4 args for
// Express to recognize it as an error middleware. Anything thrown or passed
// to next(err) in a route/middleware above lands here instead of hanging
// the request or crashing the process silently.
app.use((err, req, res, _next) => {
  reportError(err, { path: req.originalUrl, method: req.method });
  if (res.headersSent) {
    return;
  }
  res.status(err.status || 500).json({
    status: "ERROR",
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Skipped under test so integration tests can import `app` for supertest
// without also binding a real port.
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT);
}

export default app;
