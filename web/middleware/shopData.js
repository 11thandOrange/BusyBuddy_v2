import shopify from "../shopify.js";
import shop from "../backend/models/shop.model.js";
// import feedForm from "../backend/model/feedForm.js";

const shopData = async (req, res, next) => {
  let shopCreateObject;
  let shopId;
  let shopData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  console.log("shopData::::::");
  for (const data of shopData.data) {
    shopId = data.id;
    shopCreateObject = {
      shopId: data.id,
      shopName: data.name,
      shopDomain: data.domain,
      shopCountry: data.country,
      status: "active",
      myshopify_domain: data.myshopify_domain,
      data: data,
    };
  }

  let getShop = await shop.findOne({ myshopify_domain: shopData.data[0].myshopify_domain });
  console.log("getShop::::");
  if (!getShop) {
     await shop.create({ ...shopCreateObject });
  }
  console.log("shopData  finish next--------->>")
  next();
};

export default {
  shopData,
};
