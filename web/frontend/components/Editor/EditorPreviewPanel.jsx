import React, { useState } from 'react';

/**
 * EditorPreviewPanel - Right panel with preview and device toggle
 * 
 * @param {React.ReactNode} children - Preview content
 * @param {string} device - Current device ('desktop' | 'mobile')
 * @param {function} onDeviceChange - Callback when device changes
 * @param {boolean} showDeviceToggle - Whether to show device toggle (default: true)
 */
export const EditorPreviewPanel = ({ 
  children,
  device = 'desktop',
  onDeviceChange,
  showDeviceToggle = true
}) => {
  return (
    <div className="preview-panel">
      <div className="preview-content">
        <div className={`device-frame ${device}`}>
          {children}
        </div>
      </div>

      {showDeviceToggle && (
        <div className="preview-footer">
          <div className="device-toggle">
            <button
              className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
              onClick={() => onDeviceChange('desktop')}
            >
              <span className="device-icon">🖥</span>
              Desktop
            </button>
            <button
              className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
              onClick={() => onDeviceChange('mobile')}
            >
              <span className="device-icon">📱</span>
              Mobile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * StorePreview - Default store preview layout
 */
export const StorePreview = ({ 
  announcementBar,
  products = []
}) => {
  const defaultProducts = [
    { name: 'Classic T-Shirt', price: '$29.99' },
    { name: 'Denim Jacket', price: '$89.99' },
    { name: 'Sneakers', price: '$119.99' }
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  return (
    <>
      {/* Announcement Bar Slot */}
      {announcementBar}

      {/* Store Preview */}
      <div className="store-preview">
        <div className="store-header">
          <div className="store-logo">STORE</div>
          <div className="store-nav">
            <a href="#">Home</a>
            <a href="#">Shop</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="product-grid">
          {displayProducts.map((product, index) => (
            <div key={index} className="product-card">
              <div className="product-image" />
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-price">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EditorPreviewPanel;
