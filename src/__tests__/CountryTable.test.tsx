import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import type { MutableSnapshot } from 'recoil';
import { CountryTable } from '../components/CountryTable';
import { countriesState, filtersState, paginationState } from '../store/countryStore';
import { countries } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';

const setup = (page = 1, limit = 10, extra?: (s: MutableSnapshot) => void) =>
  renderWithProviders(<CountryTable />, {
    initializeState: (s) => {
      s.set(countriesState, countries);
      s.set(paginationState, { page, limit });
      extra?.(s);
    },
  });

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

describe('CountryTable', () => {
  it('has a column for name, code, continent and currency', () => {
    setup();
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent?.trim());
    expect(headers).toEqual(['Country Name', 'Country Code', 'Continent', 'Currency']);
  });

  it('shows only the rows for the current page', () => {
    setup(1, 10);
    expect(bodyRows()).toHaveLength(10);
  });

  it('shows the remaining rows on the last page', () => {
    setup(2, 10);
    expect(bodyRows()).toHaveLength(countries.length - 10);
  });

  it('shows each country with its details', () => {
    setup();
    const row = bodyRows()[0]!;

    expect(within(row).getByText('United States')).toBeInTheDocument();
    expect(within(row).getAllByText('US').length).toBeGreaterThan(0);
    expect(within(row).getByText('North America')).toBeInTheDocument();
    expect(within(row).getAllByText('USD').length).toBeGreaterThan(0);
  });

  it('shows N/A for a country with no currency', () => {
    setup();
    // the currency is rendered twice, once for small and once for wide screens
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('shows the filtered countries only', () => {
    setup(1, 10, (s) => s.set(filtersState, { continent: 'Oceania' }));

    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
  });

  it('shows a helpful message when nothing matches', () => {
    setup(1, 10, (s) => s.set(filtersState, { search: 'atlantis' }));

    expect(screen.getByText('No countries found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
  });

  it('does not show the empty message when there are rows', () => {
    setup();
    expect(screen.queryByText('No countries found')).not.toBeInTheDocument();
  });
});
