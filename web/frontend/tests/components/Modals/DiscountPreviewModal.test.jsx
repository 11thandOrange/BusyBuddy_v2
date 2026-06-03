import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DiscountPreviewModal from '../../../components/Modals/DiscountPreviewModal';
import PLACEHOLDER_IMG from '../../../assets/tshirt.png';

vi.mock('react-bootstrap', async () => {
  const React = await import('react');
  return {
    Modal: Object.assign(
      ({ show, children }) => (show ? <div data-testid="modal">{children}</div> : null),
      {
        Header: ({ children }) => <div>{children}</div>,
        Title: ({ children }) => <div>{children}</div>,
        Body: ({ children }) => <div>{children}</div>,
        Footer: ({ children }) => <div>{children}</div>,
      }
    ),
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Badge: ({ children }) => <span>{children}</span>,
    Row: ({ children }) => <div>{children}</div>,
    Col: ({ children }) => <div>{children}</div>,
    ListGroup: Object.assign(
      ({ children }) => <ul>{children}</ul>,
      { Item: ({ children }) => <li>{children}</li> }
    ),
  };
});

const baseDiscount = {
  title: 'Test Bundle',
  type: 'Bundle Discount',
  discountType: 'Percentage',
  discountValue: 20,
  status: true,
  priority: 1,
  internalName: 'test-bundle',
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2025-12-31T00:00:00Z',
  tiers: [],
  widgetAppearance: {
    primaryTextColor: '#000',
    secondaryTextColor: '#333',
    PrimaryBackgroundColor: '#fff',
    secondaryBackgroundColor: '#f0f0f0',
    cardCornerRadius: 8,
    topMargin: 10,
    bottomMargin: 10,
    isShowCountDownTimer: false,
  },
  products: [],
};

const renderModal = (products = []) =>
  render(
    <BrowserRouter>
      <DiscountPreviewModal
        show={true}
        onHide={vi.fn()}
        discount={{ ...baseDiscount, products }}
      />
    </BrowserRouter>
  );

describe('DiscountPreviewModal — product image fallback (issue #73)', () => {
  it('uses product.media as the image src when it is defined', () => {
    renderModal([{ title: 'Shirt', media: 'https://example.com/shirt.jpg', quantity: 1, optionSelections: [] }]);
    const img = screen.getByRole('img', { name: 'Shirt' });
    expect(img).toHaveAttribute('src', 'https://example.com/shirt.jpg');
  });

  it('falls back to PLACEHOLDER_IMG when product.media is null', () => {
    renderModal([{ title: 'Shirt', media: null, quantity: 1, optionSelections: [] }]);
    const img = screen.getByRole('img', { name: 'Shirt' });
    expect(img).toHaveAttribute('src', PLACEHOLDER_IMG);
  });

  it('falls back to PLACEHOLDER_IMG when product.media is undefined', () => {
    renderModal([{ title: 'Shirt', quantity: 1, optionSelections: [] }]);
    const img = screen.getByRole('img', { name: 'Shirt' });
    expect(img).toHaveAttribute('src', PLACEHOLDER_IMG);
  });

  it('falls back to PLACEHOLDER_IMG when product.media is an empty string', () => {
    renderModal([{ title: 'Shirt', media: '', quantity: 1, optionSelections: [] }]);
    const img = screen.getByRole('img', { name: 'Shirt' });
    expect(img).toHaveAttribute('src', PLACEHOLDER_IMG);
  });

  it('onError handler sets src to PLACEHOLDER_IMG when the image URL is broken', () => {
    renderModal([{ title: 'Shirt', media: 'https://broken.example.com/img.jpg', quantity: 1, optionSelections: [] }]);
    const img = screen.getByRole('img', { name: 'Shirt' });
    expect(img).toHaveAttribute('src', 'https://broken.example.com/img.jpg');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', PLACEHOLDER_IMG);
  });

  it('renders product images for multiple products', () => {
    renderModal([
      { title: 'Shirt', media: 'https://example.com/shirt.jpg', quantity: 1, optionSelections: [] },
      { title: 'Pants', media: null, quantity: 2, optionSelections: [] },
    ]);
    expect(screen.getByRole('img', { name: 'Shirt' })).toHaveAttribute('src', 'https://example.com/shirt.jpg');
    expect(screen.getByRole('img', { name: 'Pants' })).toHaveAttribute('src', PLACEHOLDER_IMG);
  });

  it('renders nothing when discount prop is null', () => {
    const { container } = render(
      <BrowserRouter>
        <DiscountPreviewModal show={true} onHide={vi.fn()} discount={null} />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
