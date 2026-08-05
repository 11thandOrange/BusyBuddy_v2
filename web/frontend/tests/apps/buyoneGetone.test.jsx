import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BuyonegetoneForm from '../../apps/buy-one-get-one/buyoneGetone';

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

describe('BuyonegetoneForm (App Homepage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Initial Render', () => {
    it('should NOT auto-trigger editor mode on mount', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      expect(screen.getByText('Create New BOGO')).toBeInTheDocument();
    });

    it('should render homepage view by default', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      expect(screen.getByText('Buy One Get One')).toBeInTheDocument();
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should display "Create New BOGO" button', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      expect(screen.getByText('Create New BOGO')).toBeInTheDocument();
    });

    it('should display ToggleSwitch component with correct appId', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toHaveAttribute('data-app-id', 'buy_one_get_one');
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

    it('should open /editor.html#/buy-one-get-one/editor in new tab', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<BuyonegetoneForm />);

      const createButton = screen.getByText('Create New BOGO');
      fireEvent.click(createButton);
      await flush();

      expect(global.open).toHaveBeenCalledWith('', '_blank');
      expect(fakeWindow.location.href).toContain('/editor.html');
      expect(fakeWindow.location.href).toContain('#/buy-one-get-one/editor');
    });

    it('should include shop parameter in URL', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<BuyonegetoneForm />);

      const createButton = screen.getByText('Create New BOGO');
      fireEvent.click(createButton);
      await flush();

      expect(fakeWindow.location.href).toContain('shop=');
    });
  });

  describe('DiscountList', () => {
    it('should render DiscountList component', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should pass correct discountType="Buy One Get One"', () => {
      renderWithRouter(<BuyonegetoneForm />);
      
      const discountList = screen.getByTestId('discount-list');
      expect(discountList).toHaveAttribute('data-type', 'Buy One Get One');
    });
  });
});
