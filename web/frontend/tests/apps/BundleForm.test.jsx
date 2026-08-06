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

vi.mock('../../components/ThemeExtensionBanner', () => ({
  default: () => null,
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
    // openEditorTab() (web/frontend/utils/openEditorTab.js) calls
    // window.open('', '_blank') synchronously - required so browsers still
    // attribute the popup to this click - then navigates that tab to the
    // real editor.html URL once it has fetched a signature. So the URL
    // isn't on the window.open() call itself; it lands on the opened
    // window's .location.href a tick later.
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should open /editor.html#/bundle-discount/editor in new tab', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<BundleForm />);

      const createButton = screen.getByText('Create New Bundle');
      fireEvent.click(createButton);
      await flush();

      expect(global.open).toHaveBeenCalledWith('', '_blank');
      expect(fakeWindow.location.href).toContain('/editor.html');
      expect(fakeWindow.location.href).toContain('#/bundle-discount/editor');
    });

    it('should include shop parameter in URL', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<BundleForm />);

      const createButton = screen.getByText('Create New Bundle');
      fireEvent.click(createButton);
      await flush();

      expect(fakeWindow.location.href).toContain('shop=');
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
