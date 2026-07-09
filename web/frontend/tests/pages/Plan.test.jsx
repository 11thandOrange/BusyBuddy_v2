import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import PlanPage from '../../pages/Plan';

// tests/setup.js globally mocks @shopify/polaris's AppProvider to a no-op
// passthrough (fine for components that don't render Polaris components
// directly), but Plan.jsx renders SkeletonPage/Card/Spinner from Polaris
// directly and needs the real i18n context those provide, or they throw
// MissingAppProviderError.
vi.unmock('@shopify/polaris');

// jsdom doesn't implement matchMedia, which Polaris's real AppProvider
// needs for its responsive breakpoint utilities.
window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
}));

// Plan.jsx imports the App Bridge *core* package directly (not
// @shopify/app-bridge-react, which tests/setup.js already mocks), to
// dispatch the Shopify billing confirmation redirect.
const { dispatchMock, redirectCreateMock } = vi.hoisted(() => {
  const dispatchMock = vi.fn();
  const redirectCreateMock = vi.fn(() => ({ dispatch: dispatchMock }));
  return { dispatchMock, redirectCreateMock };
});

vi.mock('@shopify/app-bridge', () => ({
  default: vi.fn(() => ({})),
}));

vi.mock('@shopify/app-bridge/actions', () => ({
  Redirect: {
    create: redirectCreateMock,
    Action: { REMOTE: 'REMOTE' },
  },
}));

const renderPlanPage = () =>
  render(
    <AppProvider i18n={{}}>
      <BrowserRouter>
        <PlanPage />
      </BrowserRouter>
    </AppProvider>
  );

/** Build a fetch mock that routes by URL + method, so each test only needs
 *  to specify the responses that matter for its scenario. */
function mockFetchSequence({ getUserSubscription, subscribe, cancelSubscription } = {}) {
  global.fetch = vi.fn((url, options = {}) => {
    if (url === '/api/subscription/getUserSubscription') {
      return getUserSubscription
        ? getUserSubscription()
        : Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Free' } }) });
    }
    if (url === '/api/subscription/subscribe' && options.method === 'POST') {
      return subscribe(JSON.parse(options.body));
    }
    if (url === '/api/subscription/cancel-subscription' && options.method === 'POST') {
      return cancelSubscription(JSON.parse(options.body));
    }
    return Promise.reject(new Error(`Unmocked fetch call: ${url}`));
  });
}

describe('Plan page - billing/subscription flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the current plan and highlights it', async () => {
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Starter' } }) }),
    });

    renderPlanPage();

    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());
    expect(screen.getByText('Starter', { selector: 'strong' })).toBeInTheDocument();
    // The current plan's card shows "Current Plan" instead of "Upgrade Now".
    expect(screen.getAllByText('Current Plan')).toHaveLength(1);
  });

  it('upgrading from Free redirects to the Shopify billing confirmation page', async () => {
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Free' } }) }),
      subscribe: (body) => {
        expect(body).toEqual({ planName: 'Starter' });
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ status: 'SUCCESS', data: { message: 'Redirect to payment', url: 'https://test-shop.myshopify.com/charges/123/confirm' } }),
        });
      },
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const starterCard = screen.getByText('Starter', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(starterCard).getByText('Upgrade Now'));

    await waitFor(() => expect(dispatchMock).toHaveBeenCalled());
    expect(redirectCreateMock).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith(
      'REMOTE',
      expect.objectContaining({ url: 'https://test-shop.myshopify.com/charges/123/confirm', newContext: true })
    );
  });

  it('switching between two paid plans (Starter -> Advanced) sends the correct plan name and shows the result modal', async () => {
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Starter' } }) }),
      subscribe: (body) => {
        expect(body).toEqual({ planName: 'Advanced' });
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'SUCCESS', data: { message: 'Plan updated to Advanced', url: null } }),
        });
      },
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const advancedCard = screen.getByText('Advanced', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(advancedCard).getByText('Upgrade Now'));

    await waitFor(() => expect(screen.getByText('Subscription Updated')).toBeInTheDocument());
    expect(screen.getByText('Plan updated to Advanced')).toBeInTheDocument();
  });

  it('downgrading from a paid plan to Free asks for confirmation and shows the result modal', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Starter' } }) }),
      subscribe: (body) => {
        expect(body).toEqual({ planName: 'Free' });
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'SUCCESS',
              data: { message: "You've been downgraded to the Free plan.", url: null },
            }),
        });
      },
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const freeCard = screen.getByText('Free', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(freeCard).getByText('Get Started'));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Subscription Updated')).toBeInTheDocument());
    expect(screen.getByText("You've been downgraded to the Free plan.")).toBeInTheDocument();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('does not downgrade when the user cancels the confirm dialog', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const subscribeFn = vi.fn();
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Starter' } }) }),
      subscribe: subscribeFn,
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const freeCard = screen.getByText('Free', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(freeCard).getByText('Get Started'));

    expect(confirmSpy).toHaveBeenCalled();
    expect(subscribeFn).not.toHaveBeenCalled();
  });

  it('cancelling a subscription shows a cancelling state, then the result modal, then re-syncs the plan', async () => {
    let getUserSubscriptionCallCount = 0;
    mockFetchSequence({
      getUserSubscription: () => {
        getUserSubscriptionCallCount += 1;
        const planName = getUserSubscriptionCallCount === 1 ? 'Starter' : 'Free';
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName } }) });
      },
      cancelSubscription: (body) => {
        expect(body).toEqual({ planName: 'Starter' });
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'SUCCESS', data: { message: 'Your subscription has been cancelled successfully.' } }),
        });
      },
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    // Both the banner and the current-plan's card render a "Cancel
    // Subscription" button; either triggers the same confirmation flow.
    fireEvent.click(screen.getAllByText('Cancel Subscription')[0]);
    expect(screen.getByText('Confirm Cancellation')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Cancel Subscription'));

    await waitFor(() => expect(screen.getByText('Subscription Cancelled')).toBeInTheDocument());
    expect(screen.getByText('Your subscription has been cancelled successfully.')).toBeInTheDocument();
    // fetchUserSubscription() is re-triggered after a successful cancellation.
    expect(getUserSubscriptionCallCount).toBe(2);
  });

  it('shows an error modal when the subscribe request fails', async () => {
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Free' } }) }),
      subscribe: () =>
        Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({ error: 'Billing service unavailable' }) }),
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const starterCard = screen.getByText('Starter', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(starterCard).getByText('Upgrade Now'));

    await waitFor(() => expect(screen.getByText('Subscription Error')).toBeInTheDocument());
    expect(screen.getByText('Billing service unavailable')).toBeInTheDocument();
  });

  it('shows a timeout-specific message when the subscribe request is aborted (regression: hung "Processing" modal)', async () => {
    mockFetchSequence({
      getUserSubscription: () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'SUCCESS', data: { planName: 'Free' } }) }),
      subscribe: () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        return Promise.reject(err);
      },
    });

    renderPlanPage();
    await waitFor(() => expect(screen.getByText(/Your current plan:/)).toBeInTheDocument());

    const starterCard = screen.getByText('Starter', { selector: 'h2' }).closest('.planboxes');
    fireEvent.click(within(starterCard).getByText('Upgrade Now'));

    // Before the AbortController timeout fix, a hung request left the
    // "Processing your subscription" modal on screen forever.
    await waitFor(() => expect(screen.getByText('Subscription Error')).toBeInTheDocument());
    expect(screen.getByText('Request timed out. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('Processing your subscription')).not.toBeInTheDocument();
  });
});
