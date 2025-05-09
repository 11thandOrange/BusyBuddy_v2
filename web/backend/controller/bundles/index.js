import { getCreateBundlesMutation, getBundleStatusMutation, getBundlePriceUpdateMutation, getUpdatedBundleMutation, getProductStatusUpdateMutation } from "../../services/mutations.js";
import shopify from "../../../shopify.js";

/**
 * Creates a product bundle with optional discounting
 * @param {Object} req - Request object containing bundle details
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response with bundle creation status
 */
async function createProductBundleV2(req, res) {
    try {
        const session = res.locals.shopify.session;
        const client = new shopify.api.clients.Graphql({
            session: session,
            apiVersion: "2024-10",
        });

        const { title, products, discountType, discountValue, status } = req.body;

        // 1. Create the bundle
        const bundleId = await createBundle(client, session, title, products);
        if (!bundleId) {
            return res.status(500).json({
                status: false,
                error: "Failed to create bundle operation"
            });
        }

        // 2. Wait for bundle creation to complete
        const completedOperation = await pollBundleStatus(client, session, bundleId);
        if (!completedOperation || !completedOperation.product) {
            return res.status(500).json({
                status: false,
                error: "Bundle creation failed or timed out"
            });
        }
        
        const productId = completedOperation.product.id;
        const variants = completedOperation.product.variants.nodes;
        console.log(" createProductBundleV2 | variants:", variants)

        // 3. Update prices if discount is provided
        let priceUpdateResult = null;
        if (discountType && discountValue !== undefined) {
            const variantUpdates = calculateVariantPrices(variants, discountType, discountValue);
            priceUpdateResult = await updateVariantPrices(client, session, productId, variantUpdates);
        } else {
            console.log("No discount information provided, skipping price update");
        }

        // 4. Update the bundle status to active
        const statusUpdateResult = await updateProductStatus(client, session, productId, status);

        // 5. Get updated product data
        const updatedProductData = await getUpdatedProductData(client, session, productId);

        return res.status(201).json({
            status: true,
            bundleData: completedOperation,
            priceUpdate: priceUpdateResult ? {
                discountType,
                discountValue,
                updatedVariants: updatedProductData.data.product.variants.nodes
            } : "No price update applied",
            statusUpdate: {
                newStatus: statusUpdateResult.data.productUpdate.product.status
            }
        });
    } catch (error) {
        console.error("Error creating product bundle:", error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
}

/**
 * Creates the initial bundle
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} title - Bundle title
 * @param {Array} products - Products to include in bundle
 * @returns {Promise<string>} - Bundle operation ID
 */
async function createBundle(client, session, title, products) {
    try {
        const componentsString = formatComponentsString(products);
        const bundleCreateMutation = getCreateBundlesMutation(title, componentsString);

        const result = await client.request(bundleCreateMutation, { session });
        console.log("Bundle creation initiated:", JSON.stringify(result, null, 2));

        return result?.data?.productBundleCreate?.productBundleOperation?.id;
    } catch (error) {
        console.error("Error creating bundle:", error);
        throw error;
    }
}

/**
 * Formats the component string for GraphQL mutation
 * @param {Array} products - Products to include in bundle
 * @returns {string} - Formatted components string
 */
function formatComponentsString(products) {
    return products.map((product) => {
        const optionsString = product.optionSelections.map((option) => {
            return `{
                componentOptionId: "${option.componentOptionId}",
                name: "${option.uniqueName}",
                values: ${JSON.stringify(option.values)}
            }`;
        }).join(", ");

        return `{
            productId: "${product.productId}",
            quantity: ${product.quantity},
            optionSelections: [${optionsString}]
        }`;
    }).join(", ");
}

/**
 * Polls bundle operation status until completion or failure
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} operationId - Bundle operation ID
 * @returns {Promise<Object>} - Completed operation data
 */
async function pollBundleStatus(client, session, operationId) {
    const MAX_RETRIES = 30;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        attempts++;

        try {
            const query = getBundleStatusMutation(operationId);
            const response = await client.request(query, { session });
            const status = response.data.productOperation.status;

            console.log(`Bundle operation status (attempt ${attempts}): ${status}`);

            if (status === "COMPLETE" && response.data.productOperation.product) {
                return response.data.productOperation;
            } else if (status === "FAILED") {
                console.error("Bundle creation failed");
                throw new Error("Bundle creation failed on Shopify");
            }

            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Error polling bundle status:", error);
            throw error;
        }
    }

    throw new Error("Bundle creation timed out after maximum retries");
}

/**
 * Calculates new prices for variants based on discount
 * @param {Array} variants - Product variants
 * @param {string} discountType - Type of discount (percentage, fixed, price)
 * @param {string|number} discountValue - Discount amount
 * @returns {Array} - Updated variant price information
 */
function calculateVariantPrices(variants, discountType, discountValue) {
    const amount = parseFloat(discountValue);

    return variants.map(variant => {
        const originalPrice = parseFloat(variant.price);
        let newPrice = originalPrice;
        let compareAtPrice = originalPrice;

        // Calculate new price based on discount type
        if (discountType.toLowerCase() === "percentage") {
            newPrice = originalPrice * (1 - (amount / 100));
        } else if (discountType.toLowerCase() === "fixed") {
            newPrice = Math.max(0, originalPrice - amount);
        } else if (discountType.toLowerCase() === "price") {
            newPrice = amount;
            compareAtPrice = originalPrice > newPrice ? originalPrice : null;
        }

        // Round to 2 decimal places
        newPrice = parseFloat(newPrice.toFixed(2));

        return {
            id: variant.id,
            price: newPrice.toString(),
            compareAtPrice: compareAtPrice > newPrice ? compareAtPrice.toString() : null
        };
    });
}

/**
 * Updates variant prices
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} productId - Product ID
 * @param {Array} variantUpdates - Variant price updates
 * @returns {Promise<Object>} - Price update result
 */
async function updateVariantPrices(client, session, productId, variantUpdates) {
    try {
        const variantsString = variantUpdates
            .map(variant => {
                let variantString = `{
                    id: "${variant.id}",
                    price: "${variant.price}"`;

                if (variant.compareAtPrice) {
                    variantString += `,
                    compareAtPrice: "${variant.compareAtPrice}"`;
                }

                variantString += `
                }`;

                return variantString;
            })
            .join(", ");

        const updatePriceMutation = getBundlePriceUpdateMutation(productId, variantsString);
        const result = await client.request(updatePriceMutation, { session });
        console.log("Price update result:", JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error("Error updating variant prices:", error);
        throw error;
    }
}

/**
 * Updates product status to active
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Status update result
 */
async function updateProductStatus(client, session, productId, status) {
    try {
        const updateStatusMutation = getProductStatusUpdateMutation(productId, status);
        const result = await client.request(updateStatusMutation, { session });
        console.log("Status update result:", JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error("Error updating product status:", error);
        throw error;
    }
}

/**
 * Gets updated product data
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Updated product data
 */
async function getUpdatedProductData(client, session, productId) {
    try {
        const query = getUpdatedBundleMutation(productId);
        return await client.request(query, { session });
    } catch (error) {
        console.error("Error getting updated product data:", error);
        throw error;
    }
}

// Note: These functions need to be defined elsewhere in your code
// - getCreateBundlesMutation
// - getBundleStatusMutation
// - getBundlePriceUpdateMutation
// - getProductStatusUpdateMutation
// - getUpdatedBundleMutation
export { createProductBundleV2 };
