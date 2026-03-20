import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MixMatchForm from '../../apps/mix-and-match-discounts/MixMatchForm';

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

describe('MixMatchForm (App Homepage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Initial Render', () => {
    it('should NOT auto-trigger editor mode on mount', () => {
      renderWithRouter(<MixMatchForm />);
      
      expect(screen.getByText('Create New Mix & Match')).toBeInTheDocument();
    });

    it('should render homepage view by default', () => {
      renderWithRouter(<MixMatchForm />);
      
      expect(screen.getByText('Mix and Match')).toBeInTheDocument();
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should display "Create New Mix & Match" button', () => {
      renderWithRouter(<MixMatchForm />);
      
      expect(screen.getByText('Create New Mix & Match')).toBeInTheDocument();
    });

    it('should display ToggleSwitch component with correct appId', () => {
      renderWithRouter(<MixMatchForm />);
      
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toHaveAttribute('data-app-id', 'mix_match');
    });
  });

  describe('Create Button', () => {
    it('should open /editor.html#/mix-and-match/editor in new tab', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<MixMatchForm />);
      
      const createButton = screen.getByText('Create New Mix & Match');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/editor.html'),
        '_blank'
      );
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('#/mix-and-match/editor'),
        '_blank'
      );
    });

    it('should include shop parameter in URL', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<MixMatchForm />);
      
      const createButton = screen.getByText('Create New Mix & Match');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('shop='),
        '_blank'
      );
    });
  });

  describe('DiscountList', () => {
    it('should render DiscountList component', () => {
      renderWithRouter(<MixMatchForm />);
      
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should pass correct discountType="Mix and Match"', () => {
      renderWithRouter(<MixMatchForm />);
      
      const discountList = screen.getByTestId('discount-list');
      expect(discountList).toHaveAttribute('data-type', 'Mix and Match');
    });
  });
});
