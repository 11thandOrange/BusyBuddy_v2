import React from 'react';

/**
 * ProductPagePreview - Shared product page layout for discount editor previews
 * 
 * Displays a mock product page with:
 * - Left column: Product image with thumbnail gallery
 * - Right column: Product info (title, rating, price, description, specs) + widget slot
 * 
 * @param {string} widgetLabel - Label shown above the widget (e.g., "Bundle Offer", "BOGO Deal")
 * @param {React.ReactNode} children - The app-specific widget to render
 */
export const ProductPagePreview = ({ 
  widgetLabel = "Special Offer",
  children 
}) => {
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
            border: '1px solid #eee'
          }}>
            <span style={{ fontSize: '64px', opacity: 0.4 }}>📦</span>
          </div>
          {/* Thumbnail Gallery */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: '50px', 
                height: '50px', 
                background: '#f8f8f8', 
                borderRadius: '8px',
                border: i === 1 ? '2px solid #1a1a1a' : '1px solid #eee',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '16px', opacity: 0.3 }}>📦</span>
              </div>
            ))}
          </div>
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
            Premium Wireless Headphones Pro
          </h1>
          
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ color: '#f5a623', fontSize: '12px' }}>★★★★★</span>
            <span style={{ fontSize: '11px', color: '#666' }}>4.8 (2,847 reviews)</span>
          </div>
          
          {/* Price */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>$1,299.00</span>
            <span style={{ 
              fontSize: '12px', 
              color: '#999', 
              textDecoration: 'line-through', 
              marginLeft: '8px' 
            }}>$1,599.00</span>
          </div>
          
          {/* Description */}
          <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '12px' }}>
            Experience premium sound quality with active noise cancellation. 40-hour battery life, comfortable over-ear design.
          </p>
          
          {/* Specifications */}
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
              <div>• Battery: 40 hours</div>
              <div>• Bluetooth: 5.2</div>
              <div>• Weight: 250g</div>
              <div>• Driver: 40mm</div>
            </div>
          </div>
          
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
            Add to Cart
          </button>
          
          {/* Widget Section */}
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
        </div>
      </div>
    </div>
  );
};

export default ProductPagePreview;
