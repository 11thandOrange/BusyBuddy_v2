import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  transformProductNode,
  stripHtmlToText,
  metafieldsToSpecs,
  buildAutoDescription,
  enrichProductsWithLiveData,
} from '../../utils/productEnrichment.js';

describe('stripHtmlToText', () => {
  it('strips tags and collapses whitespace', () => {
    expect(stripHtmlToText('<p>Hello <strong>world</strong></p>\n<p>Second</p>')).toBe('Hello world Second');
  });

  it('returns an empty string for falsy input', () => {
    expect(stripHtmlToText(undefined)).toBe('');
    expect(stripHtmlToText('')).toBe('');
  });
});

describe('transformProductNode', () => {
  it('builds the editor product shape from a Shopify product node, including description and metafields', () => {
    const node = {
      id: 'gid://shopify/Product/1',
      title: 'T-Shirt',
      descriptionHtml: '<p>A soft <b>cotton</b> tee.</p>',
      handle: 't-shirt',
      featuredMedia: { image: { url: 'https://cdn/featured.jpg' } },
      images: { edges: [{ node: { url: 'https://cdn/a.jpg' } }, { node: { url: 'https://cdn/b.jpg' } }] },
      options: [{ id: 'opt1', name: 'Size', values: ['S', 'M'] }],
      variants: { edges: [{ node: { price: '19.99', title: 'S' } }] },
      metafields: { nodes: [{ namespace: 'custom', key: 'material', value: 'Cotton', type: 'single_line_text_field' }] },
    };

    const result = transformProductNode(node);

    expect(result.productId).toBe('gid://shopify/Product/1');
    expect(result.title).toBe('T-Shirt');
    expect(result.price).toBe('19.99');
    expect(result.images).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg']);
    expect(result.media).toBe('https://cdn/a.jpg');
    expect(result.description).toBe('A soft cotton tee.');
    expect(result.metafields).toEqual([{ namespace: 'custom', key: 'material', value: 'Cotton', type: 'single_line_text_field' }]);
    expect(result.optionSelections).toEqual([
      { componentOptionId: 'opt1', name: 'Size', uniqueName: 'T-Shirt Size', values: ['S', 'M'] },
    ]);
  });

  it('falls back to featuredMedia when the images list is empty, and to null when there is no image at all', () => {
    const withFeatured = transformProductNode({ id: '1', title: 'X', images: { edges: [] }, featuredMedia: { image: { url: 'https://cdn/f.jpg' } } });
    expect(withFeatured.media).toBe('https://cdn/f.jpg');
    expect(withFeatured.images).toEqual(['https://cdn/f.jpg']);

    const withNothing = transformProductNode({ id: '1', title: 'X', images: { edges: [] } });
    expect(withNothing.media).toBeNull();
    expect(withNothing.images).toEqual([]);
  });
});

describe('metafieldsToSpecs', () => {
  it('formats simple text metafields into label/value rows tagged as product-sourced', () => {
    const product = {
      title: 'T-Shirt',
      metafields: [{ key: 'care_instructions', value: 'Machine wash cold', type: 'single_line_text_field' }],
    };

    expect(metafieldsToSpecs(product)).toEqual([
      { label: 'Care Instructions (T-Shirt)', value: 'Machine wash cold', source: 'product' },
    ]);
  });

  it('formats boolean, list, and dimension metafield types', () => {
    const product = {
      title: 'Hoodie',
      metafields: [
        { key: 'is_waterproof', value: 'true', type: 'boolean' },
        { key: 'colors', value: '["Red","Blue"]', type: 'list.single_line_text_field' },
        { key: 'weight', value: '{"value":1.5,"unit":"KG"}', type: 'weight' },
      ],
    };

    expect(metafieldsToSpecs(product)).toEqual([
      { label: 'Is Waterproof (Hoodie)', value: 'Yes', source: 'product' },
      { label: 'Colors (Hoodie)', value: 'Red, Blue', source: 'product' },
      { label: 'Weight (Hoodie)', value: '1.5 KG', source: 'product' },
    ]);
  });

  it('skips metafields with no value and non-displayable types (json/rich_text/references)', () => {
    const product = {
      title: 'X',
      metafields: [
        { key: 'empty', value: '', type: 'single_line_text_field' },
        { key: 'blob', value: '{"a":1}', type: 'json' },
        { key: 'related', value: 'gid://shopify/Product/2', type: 'product_reference' },
      ],
    };

    expect(metafieldsToSpecs(product)).toEqual([]);
  });

  it('returns an empty array when the product has no metafields', () => {
    expect(metafieldsToSpecs({ title: 'X' })).toEqual([]);
  });
});

describe('buildAutoDescription', () => {
  it('joins each product\'s description with a blank line, skipping empty ones', () => {
    const products = [{ description: 'First product.' }, { description: '' }, { description: 'Second product.' }];
    expect(buildAutoDescription(products)).toBe('First product.\n\nSecond product.');
  });

  it('returns an empty string for no products', () => {
    expect(buildAutoDescription([])).toBe('');
    expect(buildAutoDescription(undefined)).toBe('');
  });
});

describe('enrichProductsWithLiveData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('merges live data onto existing products by productId, preserving quantity', async () => {
    const liveNode = {
      id: 'gid://shopify/Product/1',
      title: 'T-Shirt (updated)',
      images: { edges: [{ node: { url: 'https://cdn/new.jpg' } }] },
      variants: { edges: [{ node: { price: '25.00' } }] },
      metafields: { nodes: [] },
    };
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: true, data: { edges: [{ node: liveNode }] } }), { status: 200 })
    );

    const stale = [{ productId: 'gid://shopify/Product/1', title: 'T-Shirt (stale)', quantity: 3, images: [] }];
    const result = await enrichProductsWithLiveData(stale);

    expect(result).toEqual([
      expect.objectContaining({ productId: 'gid://shopify/Product/1', title: 'T-Shirt (updated)', price: '25.00', quantity: 3, images: ['https://cdn/new.jpg'] }),
    ]);
  });

  it('keeps the original product untouched when the live fetch has no match for it (e.g. a deleted product)', async () => {
    global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: true, data: { edges: [] } }), { status: 200 }));

    const stale = [{ productId: 'gid://shopify/Product/1', title: 'Still here', quantity: 1 }];
    const result = await enrichProductsWithLiveData(stale);

    expect(result).toEqual(stale);
  });

  it('returns the original products unchanged on a fetch failure', async () => {
    global.fetch.mockResolvedValueOnce(new Response('Server error', { status: 500 }));

    const stale = [{ productId: 'gid://shopify/Product/1', title: 'Unchanged', quantity: 1 }];
    const result = await enrichProductsWithLiveData(stale);

    expect(result).toEqual(stale);
  });

  it('returns an empty array as-is without calling fetch', async () => {
    const result = await enrichProductsWithLiveData([]);
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
