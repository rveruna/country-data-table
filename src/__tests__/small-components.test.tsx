import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from '../components/ErrorAlert';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { NetworkStatus } from '../components/NetworkStatus';
import { TableHeader } from '../components/TableHeader';
import { TableSkeleton } from '../components/TableSkeleton';
import { countriesAtom } from '../store/countryStore';
import { countries } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';

describe('ErrorAlert', () => {
  it('shows a default title and the message', () => {
    render(<ErrorAlert message="Something broke" />);

    expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('shows a custom title', () => {
    render(<ErrorAlert title="Failed to load" message="x" />);
    expect(screen.getByRole('heading', { name: 'Failed to load' })).toBeInTheDocument();
  });

  it('offers no buttons when there is nothing to retry or dismiss', () => {
    render(<ErrorAlert message="x" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry from the Try Again button', async () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="x" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss from the Dismiss button', async () => {
    const onDismiss = vi.fn();
    render(<ErrorAlert message="x" onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('also dismisses from the close icon', async () => {
    const onDismiss = vi.fn();
    render(<ErrorAlert message="x" onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  let shouldThrow = true;
  const Boom = () => {
    if (shouldThrow) throw new Error('kaboom');
    return <div>all good</div>;
  };

  const quietly = () => vi.spyOn(console, 'error').mockImplementation(() => {});

  it('renders its children when nothing goes wrong', () => {
    render(
      <ErrorBoundary>
        <div>child</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('shows a fallback with the technical details when a child throws', () => {
    quietly();
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();
  });

  it('logs the error', () => {
    const spy = quietly();
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(spy).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error), expect.anything());
  });

  it('recovers with Try Again once the cause is gone', async () => {
    quietly();
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('reloads the page with Refresh Page', async () => {
    quietly();
    shouldThrow = true;
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, reload }, writable: true });

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Refresh Page' }));

    expect(reload).toHaveBeenCalledTimes(1);
    Object.defineProperty(window, 'location', { value: original, writable: true });
  });

  it('uses a custom fallback and hands it the error and a reset function', async () => {
    quietly();
    shouldThrow = true;
    const Fallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <button onClick={resetError}>custom: {error.message}</button>
    );
    render(
      <ErrorBoundary fallback={Fallback}>
        <Boom />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'custom: kaboom' }));

    expect(screen.getByText('all good')).toBeInTheDocument();
  });
});

describe('NetworkStatus', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows nothing while online', () => {
    const { container } = render(<NetworkStatus />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a banner when the browser goes offline and hides it when it returns', () => {
    render(<NetworkStatus />);

    act(() => void window.dispatchEvent(new Event('offline')));
    expect(screen.getByText(/No internet connection/)).toBeInTheDocument();

    act(() => void window.dispatchEvent(new Event('online')));
    expect(screen.queryByText(/No internet connection/)).not.toBeInTheDocument();
  });

  it('starts with the banner when the page opens offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<NetworkStatus />);

    expect(screen.getByText(/No internet connection/)).toBeInTheDocument();
  });

  it('stops listening when it unmounts', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<NetworkStatus />);

    unmount();

    expect(remove).toHaveBeenCalledWith('online', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('TableHeader', () => {
  const setup = (n: number) =>
    renderWithProviders(<TableHeader />, {
      initializeState: (s) => s.set(countriesAtom, countries.slice(0, n)),
    });

  it('shows the number of countries found', () => {
    setup(5);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('countries found')).toBeInTheDocument();
  });

  it('uses the singular for exactly one country', () => {
    setup(1);
    expect(screen.getByText('country found')).toBeInTheDocument();
  });

  it('uses the plural for none', () => {
    setup(0);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('countries found')).toBeInTheDocument();
  });
});

describe('TableSkeleton', () => {
  it('is hidden from assistive technology, because it is only a placeholder', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws ten placeholder rows by default', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
  });

  it('draws the number of rows asked for', () => {
    const { container } = render(<TableSkeleton rows={3} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
  });
});
