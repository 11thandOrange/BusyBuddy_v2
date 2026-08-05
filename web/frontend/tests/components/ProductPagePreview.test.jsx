import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductPagePreview } from '../../components/Editor/ProductPagePreview';

// The live preview's image slot used to be 100% hardcoded (a static gray
// box + 4 fake thumbnail boxes, all just a 📦 emoji) regardless of which
// products were actually selected in the bundle. It now renders the real
// images from the bundle's selected products, matching what the "Selected
// Products" tab's own carousel already shows for each product.
describe('ProductPagePreview', () => {
  it('shows the placeholder emoji when there are no real images', () => {
    render(<ProductPagePreview widgetLabel="Bundle Offer">child content</ProductPagePreview>);

    expect(screen.getByText('📦')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows the first real product image as the main image instead of the placeholder', () => {
    render(
      <ProductPagePreview widgetLabel="Bundle Offer" images={['a.jpg', 'b.jpg']}>
        child content
      </ProductPagePreview>
    );

    expect(screen.queryByText('📦')).not.toBeInTheDocument();
    const mainImage = screen.getAllByRole('img')[0];
    expect(mainImage).toHaveAttribute('src', 'a.jpg');
  });

  it('renders a clickable thumbnail per real image and swaps the main image on click', () => {
    render(
      <ProductPagePreview widgetLabel="Bundle Offer" images={['a.jpg', 'b.jpg', 'c.jpg']}>
        child content
      </ProductPagePreview>
    );

    const images = screen.getAllByRole('img');
    // main image + 3 thumbnails
    expect(images).toHaveLength(4);

    const thumbnailButtons = screen.getAllByRole('button');
    fireEvent.click(thumbnailButtons[2]);

    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'c.jpg');
  });

  it('does not render a thumbnail strip when there is only one image', () => {
    render(
      <ProductPagePreview widgetLabel="Bundle Offer" images={['a.jpg']}>
        child content
      </ProductPagePreview>
    );

    // Only the main image - no thumbnail <img>/<button> pair beyond it.
    // The mock page's own static "Add to Cart" button is unrelated to the
    // gallery, so this checks image count rather than absence of buttons.
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('filters out falsy entries (e.g. a product with no images mixed in with ones that do)', () => {
    render(
      <ProductPagePreview widgetLabel="Bundle Offer" images={[null, 'a.jpg', undefined, 'b.jpg']}>
        child content
      </ProductPagePreview>
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3); // main + 2 thumbnails
    expect(images[0]).toHaveAttribute('src', 'a.jpg');
  });

  it('still renders the widget children and label', () => {
    render(
      <ProductPagePreview widgetLabel="BOGO Deal" images={['a.jpg']}>
        <div data-testid="widget-content">Widget goes here</div>
      </ProductPagePreview>
    );

    expect(screen.getByText('BOGO Deal')).toBeInTheDocument();
    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
  });

  // The bundle's own real product page (rendered when the merchant is on
  // Content > Product Info) has no upsell widget on it - there's nothing to
  // embed a widget into. The widget section (including its label) should be
  // omitted entirely rather than showing an empty dashed box with a label
  // floating over nothing.
  it('omits the widget section entirely when no children are passed', () => {
    render(<ProductPagePreview widgetLabel="Bundle Offer" images={['a.jpg']} title="Summer Bundle" price={19.99} />);

    expect(screen.queryByText('Bundle Offer')).not.toBeInTheDocument();
  });

  it('renders real title, price, description and specs when provided', () => {
    render(
      <ProductPagePreview
        title="Summer Bundle"
        price={19.99}
        compareAtPrice={29.99}
        description="A great bundle"
        specs={[{ label: 'Material', value: 'Cotton' }]}
      />
    );

    expect(screen.getByText('Summer Bundle')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('A great bundle')).toBeInTheDocument();
    expect(screen.getByText('• Material: Cotton')).toBeInTheDocument();
  });

  it('falls back to a generic title/button and shows no price row when nothing real is available', () => {
    render(<ProductPagePreview />);

    expect(screen.getByText('New Bundle')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
  });
});
