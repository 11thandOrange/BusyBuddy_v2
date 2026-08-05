import React, { useState, useEffect } from 'react';

/**
 * ProductPagePreview - Shared product page layout for discount editor previews
 *
 * Displays a mock product page with:
 * - Left column: Product image with thumbnail gallery
 * - Right column: Product info (title, price, description, specs) + widget slot
 *
 * Every field here is real, sourced from the editor's own state - the same
 * title/images/price the actual bundle product will be saved with, plus
 * whatever the merchant has entered in the editor's own "Product Info"
 * settings (description/specs). There's deliberately no rating/review count
 * - this app has no review system, so there's nothing real to show there.
 *
 * @param {string} widgetLabel - Label shown above the widget (e.g., "Bundle Offer", "BOGO Deal")
 * @param {string[]} images - Real product image URLs (from the bundle's selected products) to
 *   show in the gallery, in place of the placeholder box. Falls back to the placeholder when empty.
 * @param {string} [title] - Product title. Falls back to a generic placeholder when empty.
 * @param {number|string} [price] - Discounted price to display.
 * @param {number|string} [compareAtPrice] - Original (pre-discount) price, shown struck through.
 *   Only rendered when it's greater than `price`.
 * @param {string} [description] - Merchant-entered product description (Content > Product Info).
 * @param {Array<{label: string, value: string}>} [specs] - Merchant-entered spec rows.
 * @param {string} [addToCartText] - Button text. Falls back to "Add to Cart".
 * @param {React.ReactNode} children - The app-specific widget to render
 */
export const ProductPagePreview = ({
  widgetLabel = "Special Offer",
  images = [],
  title,
  price,
  compareAtPrice,
  description,
  specs = [],
  addToCartText,
  children
}) => {
  const validImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  // Whichever products are selected can change (a different product added,
  // one removed, a different bundle opened) - reset to the first image
  // instead of leaving the gallery pointed at an index that belonged to a
  // now-different set of images.
  useEffect(() => {
    setActiveIndex(0);
  }, [validImages.join('|')]);

  const activeImage = validImages[activeIndex];

  return (
    <div className="product-page-preview" style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column - Product Image */}
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          <div style={{
            width: '100%',
            aspectRatio: '1',
            background: '#f8f8f8',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: '1px solid #eee',
            overflow: 'hidden'
          }}>
            {activeImage ? (
              <img
                src={activeImage}
                alt="Bundle product"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '64px', opacity: 0.4 }}>📦</span>
            )}
          </div>
          {/* Thumbnail Gallery - real images from the bundle's selected products */}
          {validImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {validImages.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  style={{
                    width: '50px',
                    height: '50px',
                    background: '#f8f8f8',
                    borderRadius: '8px',
                    border: i === activeIndex ? '2px solid #1a1a1a' : '1px solid #eee',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info + Widget */}
        <div style={{ flex: '1', minWidth: 0 }}>
          {/* Product Title */}
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '6px',
            lineHeight: '1.3'
          }}>
            {title || 'New Bundle'}
          </h1>

          {/* Price */}
          {price !== undefined && price !== null && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>
                ${parseFloat(price).toFixed(2)}
              </span>
              {compareAtPrice !== undefined && compareAtPrice !== null && parseFloat(compareAtPrice) > parseFloat(price) && (
                <span style={{
                  fontSize: '12px',
                  color: '#999',
                  textDecoration: 'line-through',
                  marginLeft: '8px'
                }}>
                  ${parseFloat(compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Description - merchant-entered via Content > Product Info, no fabricated fallback */}
          {description && (
            <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '12px' }}>
              {description}
            </p>
          )}

          {/* Specifications - merchant-entered via Content > Product Info, no fabricated fallback */}
          {specs.filter((s) => s && s.label && s.value).length > 0 && (
            <div style={{ marginBottom: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>
                Specifications
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                fontSize: '10px',
                color: '#666'
              }}>
                {specs.filter((s) => s && s.label && s.value).map((s, i) => (
                  <div key={`${s.label}-${i}`}>• {s.label}: {s.value}</div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px'
          }}>
            {addToCartText || 'Add to Cart'}
          </button>

          {/* Widget Section - omitted entirely when there's no widget to show
              (e.g. the bundle's own product page has no upsell widget on it) */}
          {children && (
            <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', position: 'relative' }}>
              {/* Widget Label */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '0 8px',
                fontSize: '9px',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {widgetLabel}
              </div>

              {/* App-specific widget content */}
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPagePreview;
