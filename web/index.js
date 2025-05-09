// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import morgan from "morgan";
import router from "./backend/routes/index.js";
import conditional from "express-conditional-middleware";
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// a route to test the server
app.get("/api/test", (req, res) => {
    res.status(200).send("Hello world");
});
app.use(morgan("tiny"));
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
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

app.use("/api", router);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

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
