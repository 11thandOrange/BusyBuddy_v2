export const GET_PRODUCTS = `
        {
  products(first: 10, sortKey: CREATED_AT, reverse: true, query: "bundles:false") {
    edges {
      node {
        id
        title
        featuredMedia {
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        options(first: 100) {
          id
          name
          values
        }
        variants(first: 100) {
          nodes {
            price
            title
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor 
    }
  }
}`;

export const GET_PRODUCT_BY_IDS = (ids) => {
    return `
        {
  products(first: 10, sortKey: CREATED_AT, reverse: true, query: "(bundles:false) AND (${ids.join(' OR ')})") {
    edges {
      node {
        id
        title
        handle
        featuredMedia {
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        options(first: 100) {
          id
          name
          values
        }
        variants(first: 100) {
          nodes {
            price
            title
          }
        }
      }
    }
  }
}`
};

// services/mutations.js
export const getCreateBundlesMutation = (title, components) => {
  return `
    mutation {
      productBundleCreate(
        input: {
          title: "${title}",
          components: [${components}]
        }
      ) {
        productBundleOperation {
          id
          status
          product {
            id
          }
        }
        userErrors{
          field
          message
        }
      }
    }
  `;
};

export const getBundleStatusMutation = (productBundelId) => {
  return `{
    productOperation(id: "${productBundelId}") {
      status
      product {
        id
        title
        variants(first: 100) {
          nodes {
            id
            title
            price
          }
        }
      }
    }
  }`;
};

export const getBundlePriceUpdateMutation = (productId, variantsString) => {
  return `
          mutation {
            productVariantsBulkUpdate(
              productId: "${productId}",
              variants: [${variantsString}]
            ) {
              product {
                id
                title
              }
              userErrors {
                field
                message
              }
            }
          }`;
};
export const getUpdatedBundleMutation = (productId) => {
  return `{
          product(id: "${productId}") {
            title
            variants(first: 100) {
              nodes {
                id
                price
                compareAtPrice
              }
            }
          }
        }`;
};
export const getProductStatusUpdateMutation = (productId, status) => {
  return `
          mutation {
            productUpdate(
              input: {
                id: "${productId}",
                status: ${status ? 'ACTIVE' : 'DRAFT'}
              }
            ) {
              product {
                id
                title
                status
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
};
