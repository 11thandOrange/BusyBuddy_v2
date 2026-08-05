import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImageCarousel } from '../../components/Editor/ProductImageCarousel';

describe('ProductImageCarousel', () => {
  it('renders a plain image with no controls when there is only one image', () => {
    render(<ProductImageCarousel images={['a.jpg']} alt="Product" />);

    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'a.jpg');
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
  });

  it('falls back to the given fallback image when there are no images', () => {
    render(<ProductImageCarousel images={[]} fallback="placeholder.jpg" alt="Product" />);

    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'placeholder.jpg');
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('shows prev/next controls and cycles through images when there are multiple', () => {
    render(<ProductImageCarousel images={['a.jpg', 'b.jpg', 'c.jpg']} alt="Product" />);

    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'a.jpg');

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'b.jpg');

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'c.jpg');

    // wraps back to the first image
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'a.jpg');

    // wraps backward to the last image
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute('src', 'c.jpg');
  });
});
