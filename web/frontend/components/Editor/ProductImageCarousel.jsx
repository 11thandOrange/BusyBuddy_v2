import React, { useState } from 'react';

/**
 * ProductImageCarousel - cycles through a product's images with prev/next
 * arrows and dot indicators. Renders a plain <img> with no controls when
 * there's only one image (or none), so it's a safe drop-in replacement for
 * a single <img src={product.media}> anywhere in the bundle previews.
 */
export const ProductImageCarousel = ({
  images = [],
  fallback,
  alt = '',
  width = 50,
  height = 50,
  borderRadius = '8px',
  style,
}) => {
  const [index, setIndex] = useState(0);
  const list = images && images.length > 0 ? images : (fallback ? [fallback] : []);
  const hasMultiple = list.length > 1;
  const src = list[Math.min(index, list.length - 1)] || fallback;

  const goTo = (e, i) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex(((i % list.length) + list.length) % list.length);
  };

  return (
    <div
      style={{
        position: 'relative', width, height, flexShrink: 0,
        borderRadius, overflow: 'hidden', ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => goTo(e, index - 1)}
            aria-label="Previous image"
            style={{
              position: 'absolute', top: '50%', left: 2, transform: 'translateY(-50%)',
              width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '9px', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={(e) => goTo(e, index + 1)}
            aria-label="Next image"
            style={{
              position: 'absolute', top: '50%', right: 2, transform: 'translateY(-50%)',
              width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '9px', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            &#8250;
          </button>
          <div style={{
            position: 'absolute', bottom: 2, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 3,
          }}>
            {list.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;
