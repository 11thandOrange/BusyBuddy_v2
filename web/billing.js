import { GraphqlQueryError, BillingInterval } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const USAGE_CHARGE_INCREMENT_AMOUNT = 1.0;


//https://shopify.dev/docs/apps/billing
export const billingConfig = {
  "Basic": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 10,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    usageTerms: "10$ every 30 days",
  },
  "Advanced": {
    // This is an example configuration that would do a one-time charge for $10 (only USD is currently supported)
    amount: 25,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    usageTerms: "25$ every 30 days",
  },
};

export async function requestBilling(res, next) {
  const plans = Object.keys(billingConfig);
  const session = res.locals.shopify.session;
  const hasPayment = await shopify.api.billing.check({
    session,
    plans: plans,
    isTest: JSON.parse(process.env.SHOPIFY_PAYMENT_MODE),
  });

  if (hasPayment) {
    next();
  } else {
    res.redirect(
      await shopify.api.billing.request({
        session,
        plan: plans[0],
        isTest: JSON.parse(process.env.SHOPIFY_PAYMENT_MODE),
      })
    );
  }
}

const CREATE_USAGE_RECORD = `
mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $amount: Decimal!, $description: String!){
    appUsageRecordCreate(
      subscriptionLineItemId: $subscriptionLineItemId,
      description: $description,
      price: { amount: $amount, currencyCode: USD }
    ) {
      userErrors {
        field
        message
      }
      appUsageRecord {
        id
      }
    }
  }
`;

const HAS_PAYMENTS_QUERY = `
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
          id 
          name
          returnUrl
          status
          test
          trialDays
          createdAt
          currentPeriodEnd
          lineItems {
                id
                plan {
                  pricingDetails {
                    __typename
                    ... on AppRecurringPricing {
                      interval
                    }
                  }
                }
              }
          }
        }
    }
`;

// /*
//  * This function creates a usage record for the app subscription.
//  * To create a usage record, we need to know the app subscription line item ID.
//  * You may want to store this ID in your database, but for simplicity, we are
//  * querying the API for it here.
//  */
// export async function createUsageRecord(session) {
//   const client = new shopify.api.clients.Graphql({ session });
//   const subscriptionLineItem = await getAppSubscription(session);
//   const plan = Object.keys(billingConfig)[0];
//   const res = {
//     capacityReached: false,
//     createdRecord: false,
//   };

//   // If the capacity has already been reached, we will not attempt to create the usage record
//   // On production shops, if you attempt to create a usage record and the capacity and been
//   // reached Shopify will return an error. On development shops, the usage record will be created
//   if (
//     subscriptionLineItem.balanceUsed + USAGE_CHARGE_INCREMENT_AMOUNT >
//     subscriptionLineItem.cappedAmount
//   ) {
//     res.capacityReached = true;
//     return res;
//   }

//   try {
//     // This makes an API call to Shopify to create a usage record
//     await client.query({
//       data: {
//         query: CREATE_USAGE_RECORD,
//         variables: {
//           subscriptionLineItemId: subscriptionLineItem.id,
//           amount: USAGE_CHARGE_INCREMENT_AMOUNT,
//           description: billingConfig[plan].usageTerms,
//         },
//       },
//     });
//     res.createdRecord = true;
//   } catch (error) {
//     if (error instanceof GraphqlQueryError) {
//       throw new Error(
//         `${error.message}\n${JSON.stringify(error.response, null, 2)}`
//       );
//     } else {
//       throw error;
//     }
//   }

//   if (
//     subscriptionLineItem.balanceUsed + USAGE_CHARGE_INCREMENT_AMOUNT >=
//     subscriptionLineItem.cappedAmount
//   ) {
//     res.capacityReached = true;
//   }
//   return res;
// }

/*
 * This function queries the API to get the app subscription line item ID by the
 * plan name and usage terms. You may want to store this ID in your database, but
 * for simplicity, we are querying the API for it here.
 */
export async function getAppSubscription(session) {
  const client = new shopify.api.clients.Graphql({ session });
  let subscriptionLineItem = {};
  try {
    const response = await client.query({
      data: {
        query: HAS_PAYMENTS_QUERY,
      },
    });
    return response.body.data.currentAppInstallation.activeSubscriptions
    // .forEach(
    //   (subscription) => {
    //     console.log("subscription::::",JSON.stringify(subscription))
    //     if (subscription.name === planName) {
    //       subscription.lineItems.forEach((lineItem) => {
    //         if (lineItem.plan.pricingDetails.terms === planDescription) {
    //           subscriptionLineItem = {
    //             id: lineItem.id,
    //             balanceUsed: parseFloat(
    //               lineItem.plan.pricingDetails.balanceUsed.amount
    //             ),
    //             cappedAmount: parseFloat(
    //               lineItem.plan.pricingDetails.cappedAmount.amount
    //             ),
    //           };
    //         }
    //       });
    //     }
    //   }
    // );
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
  return subscriptionLineItem;
}

export async function getAppSubscriptionByPlanName(session, planName) {
  const client = new shopify.api.clients.Graphql({ session });
  let subscriptionLineItem = {};
  // const planName = Object.keys(billingConfig)[0];
  const planDescription = billingConfig[planName].usageTerms;

  try {
    const response = await client.query({
      data: {
        query: HAS_PAYMENTS_QUERY,
      },
    });
    response.body.data.currentAppInstallation.activeSubscriptions.forEach(
      (subscription) => {
        console.log("subscription:::", subscription)
        if (subscription.name === planName) {
          subscriptionLineItem = subscription
        }
      }
    );
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
  return subscriptionLineItem;
}

const CANCEL_SUBSCRIPTION_MUTATION = `
mutation AppSubscriptionCancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    userErrors {
      field
      message
    }
    appSubscription {
      id
      status
    }
  }
}
`

export async function cancelSubscriptionPlan(session, planName) {
  try {
    let planData = await getAppSubscriptionByPlanName(session, planName)
    if (!planData) {
      console.log(`Data not found for the plan : ${planName}`);
      return null;
    }
    const client = new shopify.api.clients.Graphql({ session });
    console.log("planData.id:::", planData.id)
    const cancelRes = await client.query({
      data: {
        query: CANCEL_SUBSCRIPTION_MUTATION,
        variables: {
          "id": planData.id,
          "prorate": true,
          // isTest: JSON.parse(process.env.SHOPIFY_PAYMENT_MODE),
        },
      },
    });
    console.log("cancelRes:::", cancelRes)
    return cancelRes
  } catch (error) {
    console.log("cancelSubscriptionPlan Error::", error)
    throw Error("cancelSubscriptionPlan Error")
  }
}