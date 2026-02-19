import React from 'react';
import { LiquidGlass } from '@liquidglass/react';

/**
 * LiquidGlassPanel - A reusable liquid glass effect component
 * Uses @liquidglass/react for iOS-style frosted glass UI
 * 
 * Props:
 * - variant: 'thick' | 'regular' | 'thin' (controls blur intensity)
 * - borderRadius: number (default: 16)
 * - children: React.ReactNode
 * - className: string (optional)
 * - style: object (optional)
 */
const LiquidGlassPanel = ({ 
  variant = 'regular', 
  borderRadius = 16, 
  children, 
  className = '',
  style = {}
}) => {
  // Define blur and opacity settings for different variants
  const variants = {
    thick: {
      blur: 0.8,
      brightness: 1.05,
      saturation: 1.15,
      shadowIntensity: 0.3
    },
    regular: {
      blur: 0.6,
      brightness: 1.08,
      saturation: 1.1,
      shadowIntensity: 0.25
    },
    thin: {
      blur: 0.4,
      brightness: 1.1,
      saturation: 1.05,
      shadowIntensity: 0.15
    }
  };

  const settings = variants[variant] || variants.regular;

  return (
    <LiquidGlass
      borderRadius={borderRadius}
      blur={settings.blur}
      brightness={settings.brightness}
      saturation={settings.saturation}
      shadowIntensity={settings.shadowIntensity}
      contrast={1.1}
      elasticity={0.5}
      className={`liquid-glass-panel liquid-glass-${variant} ${className}`}
    >
      <div style={style}>
        {children}
      </div>
    </LiquidGlass>
  );
};

export default LiquidGlassPanel;
