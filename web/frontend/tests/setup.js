import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.open
vi.stubGlobal('open', vi.fn());

// Mock window.location
const mockLocation = {
  search: '?shop=test-shop.myshopify.com',
  pathname: '/',
  href: 'http://localhost/',
};
vi.stubGlobal('location', mockLocation);

// Mock fetch
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
  })
));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: '?shop=test-shop.myshopify.com', pathname: '/' }),
    useParams: () => ({}),
  };
});

// Mock Shopify App Bridge
vi.mock('@shopify/app-bridge-react', () => ({
  useAppBridge: () => ({}),
  Provider: ({ children }) => children,
}));

// Mock Polaris
vi.mock('@shopify/polaris', async () => {
  const actual = await vi.importActual('@shopify/polaris');
  return {
    ...actual,
    AppProvider: ({ children }) => children,
  };
});
