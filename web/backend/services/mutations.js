export const GET_PRODUCTS = `
        {
  products(first: 10, sortKey: CREATED_AT, reverse: true, query: "bundles:false AND tag_not:busybuddybundles") {
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
  products(first: 10, sortKey: CREATED_AT, reverse: true, query: "(bundles:false) AND (${ids.join(
    " OR "
  )})") {
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
}`;
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
                title
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
                status: ${status ? "ACTIVE" : "DRAFT"}
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
export const getProductTagsUpdateMutation = (productId, status) => {
  return `
          mutation {
            productUpdate(
              input: {
                id: "${productId}",
                tags: ${JSON.stringify(status)}
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
export const GET_ORDERS = `
{
  orders(first: 100) {
    nodes {
      id
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

export const GET_BUNDLE_PRODUCTS = `
  query getProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        tags
        variants(first: 10) {
          nodes {
            id
            title
            price
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION = `{collections(query: "handle:busybuddy-bundles", first: 1){
    nodes{
      id
      title
    }
  }}`;
export const CREATE_COLLECTION = `mutation {
  collectionCreate(
    input: {title: "Bundles", ruleSet: {appliedDisjunctively: false, rules: {column: TAG, relation: EQUALS, condition: "busybuddybundles"}}, handle: "busybuddy-bundles",}
  ) {
    userErrors {
      field
      message
    }
    collection {
      id
    }
  }
}`;

export const CREATE_COLLECTIONV2 = (pubId) => {
  return `mutation {
  collectionCreate(
    input: {title: "Bundles", ruleSet: {appliedDisjunctively: false, rules: {column: TAG, relation: EQUALS, condition: "busybuddybundles"}}, handle: "busybuddy-bundles",publications: {publicationId:"${pubId}" }}
  ) {
    userErrors {
      field
      message
    }
    collection {
      id
    }
  }
}`;
};
export const GET_publications = `{
  publications(first: 10) {
    nodes {
      name
      id
    }
  }
}`;

export const GET_COLLECTIONS = `
{
collections(first: 30) {
    nodes {
      title
      products(first: 250) {
        nodes {
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
            options(first: 50) {
              id
              name
              values
            }
            variants(first: 50) {
              nodes {
                price
                title
              }
            }
        }
      }
    }
  }
}
`;
