import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { RecoilRoot, type MutableSnapshot } from 'recoil';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { GET_COUNTRIES } from '../graphql/queries';
import type { Country } from '../types/country';
import { countriesState } from '../store/countryStore';

interface Options {
  route?: string;
  initializeState?: (snapshot: MutableSnapshot) => void;
  mocks?: MockedResponse[];
}

/** Shows the current URL query string so tests can assert on it. */
export function LocationDisplay() {
  const { search } = useLocation();
  return <div data-testid="location">{search}</div>;
}

export function renderWithProviders(ui: ReactElement, { route = '/', initializeState, mocks = [] }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecoilRoot initializeState={initializeState}>
          {ui}
          <LocationDisplay />
        </RecoilRoot>
      </MockedProvider>
    </MemoryRouter>,
  );
}

/** Preloads the countries atom, as if the query had already finished. */
export const withCountries = (list: Country[]) => (snapshot: MutableSnapshot) => {
  snapshot.set(countriesState, list);
};

export const countriesQueryMock = (list: Country[]): MockedResponse => ({
  request: { query: GET_COUNTRIES },
  result: { data: { countries: list } },
});

export const countriesErrorMock = (message: string): MockedResponse => ({
  request: { query: GET_COUNTRIES },
  error: new Error(message),
});
