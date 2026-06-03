import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock heavy sub-components so this test focuses on list behaviour
vi.mock('../../components/Button', () => ({
  default: ({ text, onClick }) => <button onClick={onClick}>{text}</button>,
}));
vi.mock('../../components/Modals/DiscountPreviewModal', () => ({
  default: () => null,
}));
vi.mock('../../components/Settings', () => ({
  default: () => <div data-testid="settings" />,
}));
vi.mock('../../components/Analytics/BundleAnalytics', () => ({
  default: () => <div data-testid="analytics" />,
}));
vi.mock('../../components/OverviewTab', () => ({
  default: () => <div data-testid="overview" />,
}));
vi.mock('react-bootstrap-icons', () => ({
  Trash: () => <span>Trash</span>,
  Pencil: () => <span>Pencil</span>,
  Play: () => <span>Play</span>,
}));

import BundelDiscountList from '../../components/BundelDiscountList';

const CDN_PLACEHOLDER =
  'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1530129292';

const makeDiscount = (mediaUrl) => ({
  _id: 'disc1',
  type: 'Bundle Discount',
  title: 'Test Bundle',
  priority: 1,
  products: [{ media: mediaUrl, title: 'Test Product', quantity: 1 }],
  discountType: 'percentage',
  discountValue: '10',
  status: 'active',
  selected: false,
});

const renderList = () =>
  render(
    <BrowserRouter>
      <BundelDiscountList discountType="Bundle Discount" />
    </BrowserRouter>
  );

describe('BundelDiscountList — product image rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the product image when media is a valid URL', async () => {
    const mediaUrl = 'https://example.com/product.jpg';
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [makeDiscount(mediaUrl)] }),
      })
    );

    renderList();

    await waitFor(() => {
      const img = screen.getByAltText('Test Product');
      expect(img).toHaveAttribute('src', mediaUrl);
    });
  });

  it('falls back to CDN placeholder when product media is undefined', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [makeDiscount(undefined)] }),
      })
    );

    renderList();

    await waitFor(() => {
      const img = screen.getByAltText('Test Product');
      expect(img).toHaveAttribute('src', CDN_PLACEHOLDER);
    });
  });

  it('falls back to CDN placeholder when product media is an empty string', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [makeDiscount('')] }),
      })
    );

    renderList();

    await waitFor(() => {
      const img = screen.getByAltText('Test Product');
      expect(img).toHaveAttribute('src', CDN_PLACEHOLDER);
    });
  });

  it('shows empty state message when API returns no matching discounts', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    renderList();

    await waitFor(() => {
      expect(screen.getByText(/create your first one/i)).toBeInTheDocument();
    });
  });
});
