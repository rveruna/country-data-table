import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { createStore, Provider, type Store } from 'jotai';
import { vi } from 'vitest';
import type { Country } from '../types/country';
import { countriesAtom } from '../store/countryStore';

interface Options {
  route?: string;
  /** Sets atoms in the store the render gets, before it renders. */
  initializeState?: (store: Store) => void;
  /** Responses for successive fetch calls. When given, fetch is stubbed and a call beyond the list throws. */
  mocks?: MockResponse[];
}

/** Shows the current URL query string so tests can assert on it. */
export function LocationDisplay() {
  const { search } = useLocation();
  return <div data-testid="location">{search}</div>;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', initializeState, mocks = [] }: Options = {},
) {
  if (mocks.length > 0) stubFetch(mocks);
  // Each render gets a store of its own, so no state leaks from one test into the next
  const store = createStore();
  initializeState?.(store);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Provider store={store}>
        {ui}
        <LocationDisplay />
      </Provider>
    </MemoryRouter>,
  );
}

/** Preloads the countries atom, as if the query had already finished. */
export const withCountries = (list: Country[]) => (store: Store) => {
  store.set(countriesAtom, list);
};

export type MockResponse = { kind: 'data'; countries: Country[] } | { kind: 'error'; message: string };

export const countriesQueryMock = (list: Country[]): MockResponse => ({ kind: 'data', countries: list });

export const countriesErrorMock = (message: string): MockResponse => ({ kind: 'error', message });

/** Replaces fetch with a stub that answers each call from the list in order, and returns the stub. */
export function stubFetch(mocks: MockResponse[]) {
  let call = 0;
  const fetchMock = vi.fn(async () => {
    const mock = mocks[call++];
    if (!mock) throw new Error('Unexpected extra fetch call');
    if (mock.kind === 'error') throw new Error(mock.message);
    return new Response(JSON.stringify({ data: { countries: mock.countries } }), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
