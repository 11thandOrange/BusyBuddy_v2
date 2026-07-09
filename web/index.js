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
import { verifySHA256 } from "./middleware/verify-signature.js";
import { verifyShopifyWebhook } from "./middleware/verifyWebhook.js";
import sessionModel from "./backend/models/shopify_sessions.model.js"
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
    async (req, res, next) => {
    next();
  },
  shopify.redirectToShopifyOrAppRoot()
);
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
      const isValid = verifySHA256(_req);
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

app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/", async (_req, res, _next) => {
  // Shopify redirects here with charge_id+shop after a billing confirmation.
  // Only trust it enough to trigger a resync if the request carries a valid
  // Shopify HMAC signature - otherwise an arbitrary caller could force a
  // resync for any shop=<value> they choose.
  if (_req.query.charge_id && _req.query.shop && verifySHA256(_req)) {
    const session = await sessionModel.findOne({ shop: _req.query.shop });
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
const serveEditorHtml = (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "editor.html")).toString());
};

// Editor routes opened in new tab - validate shop session from DB
// This allows editor to work in standalone tab without Shopify embedded context
app.use("/*", async (_req, res, _next) => {
  const fullPath = _req.originalUrl || _req.url;
  const isEditorRoute = fullPath.includes('/editor');
  const shop = _req.query.shop;
  
  if (isEditorRoute && shop) {
    try {
      // Use sessionModel directly (same approach as API validation)
      const session = await sessionModel.findOne({ shop: shop });
      
      if (session && session.accessToken) {
        // Valid session exists - serve the editor HTML (no App Bridge)
        return serveEditorHtml(_req, res);
      }
    } catch (error) {
      console.log("Editor session error:", error.message);
    }
  }
  
  _next();
});

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

app.listen(PORT);
