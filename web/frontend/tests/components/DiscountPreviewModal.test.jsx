import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DiscountPreviewModal from '../../components/Modals/DiscountPreviewModal';

const CDN_PLACEHOLDER =
  'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png?v=1530129292';

const baseDiscount = {
  title: 'Test Bundle',
  type: 'Bundle Discount',
  discountType: 'percentage',
  discountValue: '10',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-12-31T00:00:00.000Z',
  products: [],
  widgetAppearance: {
    primaryTextColor: '#000000',
    secondaryTextColor: '#333333',
    PrimaryBackgroundColor: '#ffffff',
    secondaryBackgroundColor: '#f0f0f0',
    cardCornerRadius: 8,
    topMargin: 0,
    bottomMargin: 0,
    isShowCountDownTimer: false,
  },
};

const renderModal = (discountOverrides = {}, show = true) =>
  render(
    <BrowserRouter>
      <DiscountPreviewModal
        show={show}
        onHide={vi.fn()}
        discount={{ ...baseDiscount, ...discountOverrides }}
      />
    </BrowserRouter>
  );

describe('DiscountPreviewModal — product image rendering', () => {
  it('renders the product image when media is a valid URL', () => {
    renderModal({
      products: [{ media: 'https://example.com/product.jpg', title: 'Widget', quantity: 1 }],
    });

    const img = screen.getByRole('img', { name: /widget/i });
    expect(img).toHaveAttribute('src', 'https://example.com/product.jpg');
  });

  it('falls back to CDN placeholder when media is undefined', () => {
    renderModal({
      products: [{ media: undefined, title: 'Widget', quantity: 1 }],
    });

    const img = screen.getByRole('img', { name: /widget/i });
    expect(img).toHaveAttribute('src', CDN_PLACEHOLDER);
  });

  it('falls back to CDN placeholder when media is an empty string', () => {
    renderModal({
      products: [{ media: '', title: 'Widget', quantity: 1 }],
    });

    const img = screen.getByRole('img', { name: /widget/i });
    expect(img).toHaveAttribute('src', CDN_PLACEHOLDER);
  });

  it('renders correct images for multiple products', () => {
    renderModal({
      products: [
        { media: 'https://example.com/a.jpg', title: 'Product A', quantity: 1 },
        { media: undefined, title: 'Product B', quantity: 2 },
      ],
    });

    const imgA = screen.getByRole('img', { name: /product a/i });
    const imgB = screen.getByRole('img', { name: /product b/i });

    expect(imgA).toHaveAttribute('src', 'https://example.com/a.jpg');
    expect(imgB).toHaveAttribute('src', CDN_PLACEHOLDER);
  });

  it('renders nothing when discount prop is null', () => {
    const { container } = render(
      <BrowserRouter>
        <DiscountPreviewModal show={true} onHide={vi.fn()} discount={null} />
      </BrowserRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
