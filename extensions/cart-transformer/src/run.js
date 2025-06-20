
const NO_CHANGES = {
    operations: [],
};


export function run(input) {
    console.log("Running bundle expansion function on input:", JSON.stringify(input, null, 2));
    const operations = input.cart.lines.reduce(
        /** @param {CartOperation[]} acc */
        (acc, cartLine) => {
            const expandOperation = optionallyBuildExpandOperation(cartLine, input.presentmentCurrencyRate);

            if (expandOperation) {
                return [...acc, { expand: expandOperation }];
            }

            return acc;
        },
        []
    );

    return operations.length > 0 ? { operations } : NO_CHANGES;
};

function optionallyBuildExpandOperation({ id: cartLineId, merchandise, bundleVariantIds }, presentmentCurrencyRate) {
    if (merchandise.__typename === "ProductVariant" && bundleVariantIds?.value) {
        let bundleProducts = merchandise?.product?.bundledProducts?.value;
        let bundleDiscounts = merchandise?.product?.bundledDiscountValue?.value ? merchandise?.product?.bundledDiscountValue?.value.split(",") : null;
        let bundleDiscountType = merchandise?.product?.bundledDiscountType?.value || null;
        let bundleProductsLength = bundleVariantIds.value.split(",").length; // Get the number of products in the bundle

        let discountAmount = bundleDiscounts[bundleProductsLength - 2] ? parseFloat(bundleDiscounts[bundleProductsLength - 2]) : 0; // Get the discount amount for the last product in the bundle
        if (bundleProducts && bundleProducts.length > 0) {
            
            bundleProducts = bundleProducts.split(",").map((item) => {
                let [id, price] = item.split(":");
                price = parseFloat(price) || 0; // Default to 0 if price is not provided

                if(bundleDiscountType && bundleDiscountType == "percentage" && discountAmount) {
                    price = price - (price * (discountAmount / 100)); // Apply percentage discount
                }
                else if (bundleDiscountType && bundleDiscountType == "fixed" && discountAmount) {
                    // split fixed discount according to the number of products in the bundle
                    price = price - (discountAmount / bundleProductsLength); // Apply fixed discount
                }

                return {
                    id: `gid://shopify/ProductVariant/${id.trim()}`,
                    price: price,
                };
            });
        }

        let bundleData = bundleVariantIds.value.split(",").map((id) => ({
            id: `gid://shopify/ProductVariant/${id.trim()}`,
        }));

        // only keep id which are in bundleProducts and remove others
        if (bundleProducts && bundleProducts.length > 0) {
            bundleData = bundleData.filter((item) => bundleProducts.some((product) => product.id === item.id));
        }
        

        if (bundleData.length === 0 || bundleProducts.length === 0) {
            throw new Error("Invalid bundle composition");
        }

        // let bundleData = [{
        //     id: "gid://shopify/ProductVariant/51011200123156",
        //     quantity: 1,
        //     price: 100.00 // Example price, replace with actual logic to fetch price
        // }]

        const expandedCartItems = bundleData.map((component) => ({
            merchandiseId: component.id,
            quantity: 1,
            price: {
                adjustment: {
                    fixedPricePerUnit: {
                        amount : bundleProducts.find((product) => product.id === component.id)?.price || 0, // Use the price from bundleProducts
                    }
                }
            }
        }));

        if (expandedCartItems.length > 0) {
            let payload = {
                cartLineId,
                expandedCartItems,
            };
            // if (merchandise.product.bundledDiscountType.value && merchandise.product.bundledDiscountType.value == "percentage" && merchandise.product.bundledDiscountValue.value) {
            //     payload.price = {
            //         percentageDecrease: {
            //             value: parseFloat(merchandise.product.bundledDiscountValue.value),
            //         }
            //     }
            // }
            return payload;
        }
    }

    return null;
}
