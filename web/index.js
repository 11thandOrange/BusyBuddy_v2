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
import conditional from "express-conditional-middleware";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import shopData from "./middleware/shopData.js";
import { verifySHA256 } from "./middleware/verify-signature.js";
import { verifyShopifyWebhook } from "./middleware/verifyWebhook.js";
import sessionModel from "./backend/models/shopify_sessions.model.js"
import { subscriptionUpdate } from "./backend/services/subscription.js"
dotenv.config();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

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
    console.log("mongodb successfully connected***********************************");
  },
  function (error) {
    console.log("mongodb failed to connect : ", error);
  }
);
app.use(morgan("tiny"));
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopData.shopData,
    async (req, res, next) => {
    console.log("-------->**************<--------------")
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

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(
  "/api/*",
  conditional(
    (_req, res, next) => {
      if (_req.query.shop) {
        return true;
      } else {
        return false;
      }
    },
    async (_req, res, next) => {
      // @ts-ignore
      var shop = _req.query.shop.toString();
      const isValid = verifySHA256(_req);
      if (!isValid) return res.status(401).send("Unauthorized");
      const sessionId = await shopify.api.session.getOfflineId(shop);
      const session = await shopify.config.sessionStorage.loadSession(sessionId);
      console.log("index session", session);
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
    shopify.validateAuthenticatedSession()
  )
);
app.use(express.json());

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
  console.log("**********#@@!#!#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@#!@***********");
  // console.log("_req.query", _req.query)
  // console.log("res.locals",res.locals)
  if (_req.query.charge_id) {
    //find session
    const session = await sessionModel.findOne({ shop: _req.query.shop });
    // console.log("session:::",session)
    if (session) {
      subscriptionUpdate(session);
    }
  }
  _next();
});
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
