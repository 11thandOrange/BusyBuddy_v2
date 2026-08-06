import { editorFetch, safeParseJson } from './editorAuth.js';

/**
 * Shared by all 4 bundle editors: turns a raw Shopify product GraphQL node
 * (from GET /api/products) into the shape these editors store per selected
 * product. Used both when a product is freshly added via the picker and
 * when refreshing already-selected products with live data on bundle load.
 */
export function transformProductNode(node) {
  const images = node.images?.edges?.map((e) => e.node.url).filter(Boolean) || [];
  const optionSelections = node.options?.map((opt) => ({
    componentOptionId: opt.id,
    name: opt.name,
    uniqueName: `${node.title} ${opt.name}`,
    values: opt.values,
  })) || [];

  return {
    id: node.id,
    productId: node.id,
    title: node.title,
    price: node.variants?.edges?.[0]?.node?.price || node.variants?.nodes?.[0]?.price || '0.00',
    media: images[0] || node.featuredMedia?.image?.url || null,
    images: images.length ? images : (node.featuredMedia?.image?.url ? [node.featuredMedia.image.url] : []),
    handle: node.handle,
    quantity: 1,
    variants: node.variants?.edges?.map((v) => v.node) || node.variants?.nodes || [],
    optionSelections,
    description: stripHtmlToText(node.descriptionHtml),
    metafields: node.metafields?.nodes || [],
  };
}

/** Strips HTML tags to plain text - Shopify's product description is HTML,
 * but the merchant-facing field it feeds is a plain textarea. */
export function stripHtmlToText(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleCaseKey(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetafieldValue(metafield) {
  const { type, value } = metafield || {};
  if (!value) return null;

  if (type === 'boolean') return value === 'true' ? 'Yes' : 'No';

  if (type?.startsWith('list.')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {
      // fall through to raw value below
    }
    return value;
  }

  if (type === 'dimension' || type === 'volume' || type === 'weight') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && 'value' in parsed) {
        return `${parsed.value} ${parsed.unit || ''}`.trim();
      }
    } catch {
      // fall through to raw value below
    }
    return value;
  }

  // Not a simple displayable value - a JSON blob, rich text document, or a
  // reference to another resource (product/file/page/...).
  if (type === 'json' || type === 'rich_text' || type?.includes('reference')) {
    return null;
  }

  const stringValue = String(value);
  return stringValue.length > 200 ? `${stringValue.slice(0, 200)}…` : stringValue;
}

/**
 * Builds spec rows from a single product's metafields, labeled with the
 * product's own title so specs from different bundle products don't
 * collide when they share the same metafield key.
 */
export function metafieldsToSpecs(product) {
  const metafields = product?.metafields || [];
  return metafields
    .map((mf) => {
      const value = formatMetafieldValue(mf);
      if (!value) return null;
      return {
        label: `${titleCaseKey(mf.key)} (${product.title})`,
        value,
        source: 'product',
      };
    })
    .filter(Boolean);
}

/** Concatenates every selected product's own real description, in the
 * order they were added, for the Product Info tab's auto-filled description. */
export function buildAutoDescription(products) {
  return (products || [])
    .map((p) => p.description)
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Re-fetches live Shopify data (images, description, metafields, current
 * price) for products already in a bundle, keyed by their productId, and
 * merges it onto the existing product objects - preserving quantity and
 * optionSelections from the stored snapshot for any product no longer
 * found (e.g. deleted since the bundle was saved), rather than dropping it.
 */
export async function enrichProductsWithLiveData(products) {
  if (!products || products.length === 0) return products || [];

  const bareIds = products
    .map((p) => (p.productId || p.id || '').replace('gid://shopify/Product/', ''))
    .filter(Boolean);
  if (bareIds.length === 0) return products;

  try {
    const response = await editorFetch(`/api/products?ids=${bareIds.join(',')}`);
    const data = await safeParseJson(response);
    if (!response.ok) return products;

    const edges = data?.data?.edges || [];
    const liveByProductId = new Map(edges.map((edge) => [edge.node.id, transformProductNode(edge.node)]));

    return products.map((p) => {
      const live = liveByProductId.get(p.productId || p.id);
      if (!live) return p;
      return { ...live, quantity: p.quantity ?? live.quantity };
    });
  } catch (error) {
    console.error('Error refreshing live product data:', error);
    return products;
  }
}
