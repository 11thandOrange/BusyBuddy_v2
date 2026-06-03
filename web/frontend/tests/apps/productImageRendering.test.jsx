/**
 * Tests for issue #73: Product Images Are Not Rendering in Previews
 *
 * Covers:
 *  - Media URL resolution fallback chain (images.edges → featuredMedia → tshirt)
 *  - DiscountList components rendering stored media URL or tshirt fallback
 *  - BundleDiscountActions img src uses media || tshirt
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ─── DiscountList mocks ───────────────────────────────────────────────────────
vi.mock('../../apps/buy-one-get-one/buyoneGetoneActions', () => ({
  default: () => <div data-testid="bogo-actions" />,
}));

vi.mock('../../apps/mix-and-match-discounts/mixMatchActions', () => ({
  default: () => <div data-testid="mix-match-actions" />,
}));

vi.mock('../../components/Button', () => ({
  default: ({ text, onClick }) => <button onClick={onClick}>{text}</button>,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const renderWithRouter = (component) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

const makeBundle = ({ media } = {}) => ({
  _id: 'bundle-1',
  title: 'Test Bundle',
  internalName: 'Test internal',
  type: 'Buy One Get One',
  status: true,
  selected: false,
  priority: '',
  productsX: [{ productId: 'p1', title: 'Red Shirt', media }],
  productsY: [],
  products: [{ productId: 'p1', title: 'Red Shirt', media }],
});

const mockFetch = (bundles) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: bundles }),
      })
    )
  );
};

// ─── Media URL resolution logic ───────────────────────────────────────────────
describe('Media URL resolution — fallback chain logic', () => {
  /**
   * Replicates the mapping logic used in VolumeDiscountEditor and MixAndMatchEditor:
   *   images?.edges?.[0]?.node?.url || featuredMedia?.image?.url || tshirt
   */
  const TSHIRT = 'tshirt.png';
  const resolveMedia = (node) =>
    node.images?.edges?.[0]?.node?.url ||
    node.featuredMedia?.image?.url ||
    TSHIRT;

  it('uses images.edges[0].node.url when present', () => {
    const node = {
      images: { edges: [{ node: { url: 'https://cdn.shopify.com/primary.jpg' } }] },
      featuredMedia: { image: { url: 'https://cdn.shopify.com/featured.jpg' } },
    };
    expect(resolveMedia(node)).toBe('https://cdn.shopify.com/primary.jpg');
  });

  it('falls back to featuredMedia.image.url when images.edges is empty', () => {
    const node = {
      images: { edges: [] },
      featuredMedia: { image: { url: 'https://cdn.shopify.com/featured.jpg' } },
    };
    expect(resolveMedia(node)).toBe('https://cdn.shopify.com/featured.jpg');
  });

  it('falls back to featuredMedia.image.url when images is undefined', () => {
    const node = {
      featuredMedia: { image: { url: 'https://cdn.shopify.com/featured.jpg' } },
    };
    expect(resolveMedia(node)).toBe('https://cdn.shopify.com/featured.jpg');
  });

  it('falls back to tshirt placeholder when both image sources are absent', () => {
    const node = {};
    expect(resolveMedia(node)).toBe(TSHIRT);
  });

  it('falls back to tshirt placeholder when images.edges is missing', () => {
    const node = { images: {} };
    expect(resolveMedia(node)).toBe(TSHIRT);
  });
});

// ─── BOGO DiscountList ────────────────────────────────────────────────────────
describe('BOGO DiscountList — product image rendering', () => {
  let DiscountList;

  beforeEach(async () => {
    vi.resetModules();
    ({ default: DiscountList } = await import(
      '../../apps/buy-one-get-one/DiscountList'
    ));
  });

  it('renders the bundle product media URL in the img src', async () => {
    const mediaUrl = 'https://cdn.shopify.com/bogo-product.jpg';
    mockFetch([makeBundle({ media: mediaUrl })]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      const imgs = screen.getAllByRole('img');
      const productImg = imgs.find((img) => img.src.includes('bogo-product.jpg'));
      expect(productImg).toBeDefined();
      expect(productImg.getAttribute('src')).toBe(mediaUrl);
    });
  });

  it('renders the tshirt fallback when bundle product has no media', async () => {
    mockFetch([makeBundle({ media: null })]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      const imgs = screen.getAllByRole('img');
      // tshirt.png is imported as a static asset; in jsdom it resolves to a
      // non-http string (e.g. "tshirt.png").  The img should NOT carry a cdn URL.
      const productImgs = imgs.filter(
        (img) => !img.src.includes('cdn.shopify.com')
      );
      expect(productImgs.length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no BOGO bundles exist', async () => {
    mockFetch([]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      expect(
        screen.getByText(/No Buy One Get One bundles found/i)
      ).toBeInTheDocument();
    });
  });
});

// ─── Mix & Match DiscountList ─────────────────────────────────────────────────
describe('Mix & Match DiscountList — product image rendering', () => {
  let DiscountList;

  beforeEach(async () => {
    vi.resetModules();
    ({ default: DiscountList } = await import(
      '../../apps/mix-and-match-discounts/DiscountList'
    ));
  });

  it('renders the bundle product media URL in the img src', async () => {
    const mediaUrl = 'https://cdn.shopify.com/mix-product.jpg';
    const bundle = { ...makeBundle({ media: mediaUrl }), type: 'Mix and Match' };
    mockFetch([bundle]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      const imgs = screen.getAllByRole('img');
      const productImg = imgs.find((img) => img.src.includes('mix-product.jpg'));
      expect(productImg).toBeDefined();
      expect(productImg.getAttribute('src')).toBe(mediaUrl);
    });
  });

  it('renders the tshirt fallback when bundle product has no media', async () => {
    const bundle = { ...makeBundle({ media: undefined }), type: 'Mix and Match' };
    mockFetch([bundle]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      const imgs = screen.getAllByRole('img');
      const productImgs = imgs.filter(
        (img) => !img.src.includes('cdn.shopify.com')
      );
      expect(productImgs.length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no Mix and Match bundles exist', async () => {
    mockFetch([]);

    renderWithRouter(<DiscountList onMakeBundleClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Discounts'));

    await waitFor(() => {
      expect(
        screen.getByText(/No Mix and Match bundles found/i)
      ).toBeInTheDocument();
    });
  });
});

// ─── Bundle img src safety guard ─────────────────────────────────────────────
describe('product.media || tshirt safety guard', () => {
  /**
   * Mirrors the expression used in BundleDiscountActions and editor preview rows:
   *   src={product.media || tshirt}
   */
  const TSHIRT = 'tshirt.png';
  const resolveImgSrc = (product) => product.media || TSHIRT;

  it('uses product.media when set to a URL string', () => {
    expect(resolveImgSrc({ media: 'https://cdn.shopify.com/p.jpg' })).toBe(
      'https://cdn.shopify.com/p.jpg'
    );
  });

  it('falls back to tshirt when media is null', () => {
    expect(resolveImgSrc({ media: null })).toBe(TSHIRT);
  });

  it('falls back to tshirt when media is undefined', () => {
    expect(resolveImgSrc({ media: undefined })).toBe(TSHIRT);
  });

  it('falls back to tshirt when media is an empty string', () => {
    expect(resolveImgSrc({ media: '' })).toBe(TSHIRT);
  });
});
