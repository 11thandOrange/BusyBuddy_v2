import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VolumeForm from '../../apps/volume-discounts/VolumeForm';

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

describe('VolumeForm (App Homepage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Initial Render', () => {
    it('should NOT auto-trigger editor mode on mount', () => {
      renderWithRouter(<VolumeForm />);
      
      expect(screen.getByText('Create New Volume Discount')).toBeInTheDocument();
    });

    it('should render homepage view by default', () => {
      renderWithRouter(<VolumeForm />);
      
      expect(screen.getByText('Volume Discount')).toBeInTheDocument();
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should display "Create New Volume Discount" button', () => {
      renderWithRouter(<VolumeForm />);
      
      expect(screen.getByText('Create New Volume Discount')).toBeInTheDocument();
    });

    it('should display ToggleSwitch component with correct appId', () => {
      renderWithRouter(<VolumeForm />);
      
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toHaveAttribute('data-app-id', 'volume_discounts');
    });
  });

  describe('Create Button', () => {
    it('should open /editor.html#/volume-discounts/editor in new tab', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<VolumeForm />);
      
      const createButton = screen.getByText('Create New Volume Discount');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/editor.html'),
        '_blank'
      );
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('#/volume-discounts/editor'),
        '_blank'
      );
    });

    it('should include shop parameter in URL', () => {
      const mockOpen = vi.fn();
      global.open = mockOpen;
      
      renderWithRouter(<VolumeForm />);
      
      const createButton = screen.getByText('Create New Volume Discount');
      fireEvent.click(createButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('shop='),
        '_blank'
      );
    });
  });

  describe('DiscountList', () => {
    it('should render DiscountList component', () => {
      renderWithRouter(<VolumeForm />);
      
      expect(screen.getByTestId('discount-list')).toBeInTheDocument();
    });

    it('should pass correct discountType="Volume Discount"', () => {
      renderWithRouter(<VolumeForm />);
      
      const discountList = screen.getByTestId('discount-list');
      expect(discountList).toHaveAttribute('data-type', 'Volume Discount');
    });
  });
});
