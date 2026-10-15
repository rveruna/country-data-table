import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { RecoilRoot, type MutableSnapshot } from 'recoil';
import { vi } from 'vitest';
import type { Country } from '../types/country';
import { countriesState } from '../store/countryStore';

interface Options {
  route?: string;
  initializeState?: (snapshot: MutableSnapshot) => void;
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
  return render(
    <MemoryRouter initialEntries={[route]}>
      <RecoilRoot initializeState={initializeState}>
        {ui}
        <LocationDisplay />
      </RecoilRoot>
    </MemoryRouter>,
  );
}

/** Preloads the countries atom, as if the query had already finished. */
export const withCountries = (list: Country[]) => (snapshot: MutableSnapshot) => {
  snapshot.set(countriesState, list);
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
