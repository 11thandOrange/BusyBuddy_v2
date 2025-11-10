import shopify from "../../../shopify.js";
import { GET_ORDERS } from "../../services/mutations.js";
// Save inactive tab settings
async function getAnalyticsData(req, res) {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2025-07",
    });
    const { range } = req.query;

    // Calculate date filter based on range
    const filter = {};
    let createdAtFilter = "";
    if (range === "7d") {
      filter.createdAt = `>=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`;
    } else if (range === "30d") {
      filter.createdAt = `>=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`;
    } else if (range === "90d") {
      filter.createdAt = `>=${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()}`;
    }

    // Build the query with optional filters
    const GET_ORDERS = `
      {
        orders(first: 100 ${createdAtFilter ? `, query: "${createdAtFilter}"` : ""}) {
          nodes {
            id
            createdAt
            number
            lineItems(first: 100) {
              nodes {
                id
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                discountedTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItemGroup {
                  productId
                  title
                }
              }
            }
          }
        }
      }`;

    const data = await client.request(GET_ORDERS);
    // console.log("data::::::::::", data);
    const orders = data?.data?.orders?.nodes || [];
    // Analytics calculations
    const analytics = calculateBundleAnalytics(orders);

    res.status(200).json({ status: true, data: analytics });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}
function calculateBundleAnalytics(orders) {
  let totalBundleRevenue = 0;
  let ordersWithBundles = 0;
  const bundleSales = {};
  let currency = null;
  const revenueByDate = {}; // For revenue trend chart
  const orderDates = []; // To track order dates for time-based filtering

  orders.forEach((order) => {
    const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "Unknown";
    orderDates.push(orderDate);

    const lineItems = order.lineItems.nodes || [];
    let hasBundle = false;
    let orderBundleRevenue = 0;

    lineItems.forEach((item) => {
      if (item.lineItemGroup) {
        hasBundle = true;

        const bundleKey = item.lineItemGroup.title || item.lineItemGroup.productId;

        if (!bundleSales[bundleKey]) {
          bundleSales[bundleKey] = {
            quantity: 0,
            revenue: 0,
            name: item.lineItemGroup.title,
            productId: item.lineItemGroup.productId,
            currency: null,
            orders: 0, // Track number of orders containing this bundle
          };
        }

        const quantity = item.quantity || 1;
        // Prefer discounted total, else fallback to original price * qty
        const discountedAmount = item.discountedTotalSet?.shopMoney?.amount;
        const unitPrice = item.originalUnitPriceSet?.shopMoney?.amount;
        const itemRevenue = discountedAmount
          ? parseFloat(discountedAmount)
          : parseFloat(unitPrice || 0) * quantity;

        // Grab currency (same for all line items in most cases)
        const itemCurrency =
          item.discountedTotalSet?.shopMoney?.currencyCode ||
          item.originalUnitPriceSet?.shopMoney?.currencyCode ||
          null;
        if (itemCurrency) {
          currency = itemCurrency; // overall currency
          bundleSales[bundleKey].currency = itemCurrency;
        }

        bundleSales[bundleKey].quantity += quantity;
        bundleSales[bundleKey].revenue += itemRevenue;
        bundleSales[bundleKey].orders += 1;

        totalBundleRevenue += itemRevenue;
        orderBundleRevenue += itemRevenue;
      }
    });

    // Track revenue by date for the trend chart
    if (hasBundle) {
      ordersWithBundles++;

      if (!revenueByDate[orderDate]) {
        revenueByDate[orderDate] = 0;
      }
      revenueByDate[orderDate] += orderBundleRevenue;
    }
  });

  // Prepare revenue trend data (last 7 days)
  const sortedDates = Object.keys(revenueByDate).sort();
  const last7Days = sortedDates.slice(-7); // Get last 7 days with data
  const revenueTrend = last7Days.map((date) => ({
    date: formatDateForDisplay(date),
    revenue: revenueByDate[date],
    fullDate: date,
  }));

  // Get all bundles sorted by revenue (not just top 3)
  const allBundles = Object.values(bundleSales)
    .sort((a, b) => b.revenue - a.revenue)
    .map((bundle) => ({
      name: bundle.name,
      totalQuantity: bundle.quantity,
      totalRevenue: bundle.revenue,
      productId: bundle.productId,
      averagePrice: bundle.quantity > 0 ? bundle.revenue / bundle.quantity : 0,
      currency: bundle.currency || currency,
      orders: bundle.orders,
      conversionRate: ordersWithBundles > 0 ? (bundle.orders / ordersWithBundles) * 100 : 0,
    }));

  // Get top 5 bundles for the charts
  const topBundles = allBundles.slice(0, 5);

  return {
    totalBundleRevenue,
    ordersWithBundles,
    topBundles,
    totalOrdersAnalyzed: orders.length,
    bundleCount: Object.keys(bundleSales).length,
    currency,
    allBundles, // For the table (showing all bundles, not just top 3)
    revenueTrend,
    orderDates: [...new Set(orderDates)].sort(), // Unique sorted dates
  };
}

// Helper function to format dates for display
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export { getAnalyticsData };
