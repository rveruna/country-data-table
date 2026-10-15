import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import { useCountries } from '../hooks/useCountries';
import { countriesAtom } from '../store/countryStore';
import { countries } from '../test/fixtures';
import { countriesErrorMock, countriesQueryMock, stubFetch } from '../test/utils';

const wrapper = ({ children }: { children: ReactNode }) => <Provider>{children}</Provider>;

const setup = () =>
  renderHook(() => ({ ...useCountries(), countries: useAtomValue(countriesAtom) }), { wrapper });

/** A fetch that never answers on its own, but rejects like the real one when its request is aborted. */
function hangingFetch() {
  const signals: AbortSignal[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal;
      signals.push(signal);
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    }),
  );
  return signals;
}

describe('useCountries', () => {
  it('is loading while the request is pending', () => {
    hangingFetch();
    const { result } = setup();

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.countries).toEqual([]);
  });

  it('stores the countries and stops loading when the request succeeds', async () => {
    stubFetch([countriesQueryMock(countries)]);
    const { result } = setup();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.countries).toEqual(countries);
    expect(result.current.error).toBeNull();
  });

  it('reports the error and stops loading when the request fails', async () => {
    stubFetch([countriesErrorMock('Network down')]);
    const { result } = setup();

    await waitFor(() => expect(result.current.error).toBe('Network down'));

    expect(result.current.loading).toBe(false);
    expect(result.current.countries).toEqual([]);
  });

  it('requests again on refetch, clearing the error and showing loading meanwhile', async () => {
    const fetchMock = stubFetch([countriesErrorMock('Network down'), countriesQueryMock(countries)]);
    const { result } = setup();
    await waitFor(() => expect(result.current.error).toBe('Network down'));

    act(() => result.current.refetch());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.countries).toEqual(countries));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('cancels the request that is still in flight when the component goes away', () => {
    const signals = hangingFetch();
    const { unmount } = setup();
    expect(signals[0]?.aborted).toBe(false);

    unmount();

    expect(signals[0]?.aborted).toBe(true);
  });

  it('cancels the old request when it retries, and ignores the cancelled one', async () => {
    const signals = hangingFetch();
    const { result } = setup();

    act(() => result.current.refetch());

    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    // the cancelled request rejected with an AbortError, which must not be shown as an error
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
