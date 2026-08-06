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
      
      expect(screen.getByText(/Mix and Match/)).toBeInTheDocument();
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
    // openEditorTab() (web/frontend/utils/openEditorTab.js) calls
    // window.open('', '_blank') synchronously - required so browsers still
    // attribute the popup to this click - then navigates that tab to the
    // real editor.html URL once it has fetched a signature. So the URL
    // isn't on the window.open() call itself; it lands on the opened
    // window's .location.href a tick later.
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should open /editor.html#/mix-and-match/editor in new tab', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<MixMatchForm />);

      const createButton = screen.getByText('Create New Mix & Match');
      fireEvent.click(createButton);
      await flush();

      expect(global.open).toHaveBeenCalledWith('', '_blank');
      expect(fakeWindow.location.href).toContain('/editor.html');
      expect(fakeWindow.location.href).toContain('#/mix-and-match/editor');
    });

    it('should include shop parameter in URL', async () => {
      const fakeWindow = { location: { href: '' } };
      global.open = vi.fn(() => fakeWindow);

      renderWithRouter(<MixMatchForm />);

      const createButton = screen.getByText('Create New Mix & Match');
      fireEvent.click(createButton);
      await flush();

      expect(fakeWindow.location.href).toContain('shop=');
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
