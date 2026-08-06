import shopify from "../../shopify.js";
import Shop from "../models/shop.model.js";

// Shop documents are normally created exactly once, during the OAuth
// install callback (web/middleware/shopData.js's shopData middleware). If
// that ever failed to run or errored partway for a given shop, there was no
// retry - every endpoint doing a bare Shop.findOne would permanently treat
// an otherwise fully-installed, working shop as nonexistent. This lazily
// self-heals that case on read instead of leaving it broken forever.
export async function getOrCreateShop(session) {
  const existing = await Shop.findOne({ myshopify_domain: session.shop });
  if (existing) return existing;

  // A failure here (rate limit, transient network error) must not become a
  // fatal error for whatever storefront-facing endpoint called this - it
  // should just fall back to behaving as if there's no Shop doc, same as
  // if the Admin API had simply returned no data.
  try {
    const shopifyShopData = await shopify.api.rest.Shop.all({ session });
    const data = shopifyShopData.data?.[0];
    if (!data) return null;

    return await Shop.create({
      shopId: data.id,
      shopName: data.name,
      shopDomain: data.domain,
      shopCountry: data.country,
      status: "active",
      myshopify_domain: data.myshopify_domain,
      data,
      installed_at: new Date(),
    });
  } catch (error) {
    console.error("getOrCreateShop: failed to self-heal missing Shop doc:", error);
    return null;
  }
}
