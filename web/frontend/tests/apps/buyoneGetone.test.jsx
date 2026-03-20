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
    it('should open /editor.html#/buy-one-get-one/editor in new tab', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<BuyonegetoneForm />);
      
      const createButton = screen.getByText('Create New BOGO');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/editor.html'),
        '_blank'
      );
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('#/buy-one-get-one/editor'),
        '_blank'
      );
    });

    it('should include shop parameter in URL', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<BuyonegetoneForm />);
      
      const createButton = screen.getByText('Create New BOGO');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('shop='),
        '_blank'
      );
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
