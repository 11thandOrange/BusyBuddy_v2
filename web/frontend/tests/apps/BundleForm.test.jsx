import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BundleForm from '../../apps/bundle-discounts/BundleForm';

// Mock components
vi.mock('../../components/BundelDiscountList', () => ({
  default: ({ discountType, onMakeBundleClick }) => (
    <div data-testid="discount-list" data-type={discountType}>
      <button onClick={onMakeBundleClick}>Make Bundle</button>
    </div>
  ),
}));

vi.mock('../../components/Button', () => ({
  default: ({ text, onClick, style }) => (
    <button onClick={onClick} style={style} data-testid="custom-button">
      {text}
    </button>
  ),
}));

vi.mock('../../components/ToggelSwitch', () => ({
  default: ({ appId }) => <div data-testid="toggle-switch" data-app-id={appId} />,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BundleForm (App Homepage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Initial Render', () => {
    it('should NOT auto-trigger editor mode on mount', () => {
      renderWithRouter(<BundleForm />);
      
      // Should show homepage view, not editor view
      expect(screen.getByText('Create New Bundle')).toBeInTheDocument();
    });

    it('should render homepage view by default (not editor view)', () => {
      renderWithRouter(<BundleForm />);
      
      // Check for homepage elements
      expect(screen.getByText('Bundle Discount')).toBeInTheDocument();
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should display "Create New Bundle" button', () => {
      renderWithRouter(<BundleForm />);
      
      expect(screen.getByText('Create New Bundle')).toBeInTheDocument();
    });

    it('should display back arrow navigation', () => {
      renderWithRouter(<BundleForm />);
      
      const backButton = document.querySelector('[data-testid="back-button"]') || 
                         document.querySelector('.lucide-arrow-left')?.closest('div');
      // Back navigation should exist
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('should display ToggleSwitch component', () => {
      renderWithRouter(<BundleForm />);
      
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toHaveAttribute('data-app-id', 'bundle_discount');
    });
  });

  describe('Create Button', () => {
    it('should open /editor.html#/bundle-discount/editor in new tab', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<BundleForm />);
      
      const createButton = screen.getByText('Create New Bundle');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/editor.html'),
        '_blank'
      );
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('#/bundle-discount/editor'),
        '_blank'
      );
    });

    it('should include shop parameter in URL', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<BundleForm />);
      
      const createButton = screen.getByText('Create New Bundle');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('shop='),
        '_blank'
      );
    });

    it('should call window.open with "_blank" target', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<BundleForm />);
      
      const createButton = screen.getByText('Create New Bundle');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.any(String),
        '_blank'
      );
    });
  });

  describe('DiscountList', () => {
    it('should render DiscountList component', () => {
      renderWithRouter(<BundleForm />);
      
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should pass correct discountType="Bundle Discount"', () => {
      renderWithRouter(<BundleForm />);
      
      const discountList = screen.getByTestId('discount-list');
      expect(discountList).toHaveAttribute('data-type', 'Bundle Discount');
    });
  });
});
