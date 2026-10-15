import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtomValue } from 'jotai';
import { FilterControls } from '../components/FilterControls';
import { countriesAtom, filtersAtom, paginationAtom } from '../store/countryStore';
import type { CountryFilters } from '../types/country';
import { countries } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';

function Probe() {
  const filters = useAtomValue(filtersAtom);
  const pagination = useAtomValue(paginationAtom);
  return <pre data-testid="probe">{JSON.stringify({ page: pagination.page, ...filters })}</pre>;
}

const setup = (initialFilters: CountryFilters = {}, page = 3) =>
  renderWithProviders(
    <>
      <FilterControls />
      <Probe />
    </>,
    {
      initializeState: (s) => {
        s.set(countriesAtom, countries);
        s.set(filtersAtom, initialFilters);
        s.set(paginationAtom, { page, limit: 10 });
      },
    },
  );

const probe = () => JSON.parse(screen.getByTestId('probe').textContent ?? '{}');
const continent = () => screen.getByLabelText('Continent') as HTMLSelectElement;
const currency = () => screen.getByLabelText('Currency') as HTMLSelectElement;
const removeButtons = () => screen.queryAllByRole('button', { name: /^Remove / });

describe('FilterControls', () => {
  it('offers every continent, with "All Continents" first', () => {
    setup();
    const labels = Array.from(continent().options).map((o) => o.textContent);

    expect(labels).toEqual([
      'All Continents',
      'Africa',
      'Antarctica',
      'Asia',
      'Europe',
      'North America',
      'Oceania',
      'South America',
    ]);
  });

  it('offers each currency from the loaded countries once, sorted', () => {
    setup();
    const labels = Array.from(currency().options).map((o) => o.textContent);

    expect(labels[0]).toBe('All Currencies');
    expect(labels.slice(1)).toEqual([...new Set(labels.slice(1))].sort());
    expect(labels).toEqual(expect.arrayContaining(['EUR', 'LSL', 'ZAR']));
  });

  it('shows no chips and no Clear button while no filter is set', () => {
    setup();

    expect(removeButtons()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).not.toBeInTheDocument();
  });

  it('applies a continent filter, shows a chip and returns to page 1', async () => {
    setup();
    await userEvent.selectOptions(continent(), 'Europe');

    expect(probe()).toEqual({ page: 1, continent: 'Europe' });
    expect(removeButtons()).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('applies a currency filter and returns to page 1', async () => {
    setup();
    await userEvent.selectOptions(currency(), 'EUR');

    expect(probe()).toEqual({ page: 1, currency: 'EUR' });
  });

  it('removes one filter with its chip and keeps the others', async () => {
    setup({ continent: 'Europe', currency: 'EUR' });
    expect(removeButtons()).toHaveLength(2);

    await userEvent.click(removeButtons()[0]!); // the continent chip is first

    expect(probe()).toEqual({ page: 1, currency: 'EUR' });
    expect(removeButtons()).toHaveLength(1);
  });

  it('removes the currency filter with its chip and keeps the continent', async () => {
    setup({ continent: 'Europe', currency: 'EUR' });

    await userEvent.click(screen.getByRole('button', { name: 'Remove EUR filter' }));

    expect(probe()).toEqual({ page: 1, continent: 'Europe' });
  });

  it('clears every filter at once', async () => {
    setup({ continent: 'Europe', currency: 'EUR', search: 'fr' });

    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));

    expect(probe()).toEqual({ page: 1 });
    expect(removeButtons()).toHaveLength(0);
  });

  it('names each chip button after the filter it removes', () => {
    setup({ continent: 'Europe', currency: 'EUR', search: 'fr' });

    expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Remove Europe filter',
      'Remove EUR filter',
      'Remove search "fr"',
    ]);
  });

  it('shows a chip for the search and removes it', async () => {
    setup({ search: 'fr' });
    expect(removeButtons()).toHaveLength(1);

    await userEvent.click(removeButtons()[0]!);

    expect(probe()).toEqual({ page: 1 });
  });

  it('shows the search results summary only while searching', () => {
    const { container, unmount } = setup({ search: 'fr' });
    expect(container).toHaveTextContent('countries matching "fr"');
    unmount();

    const second = setup({});
    expect(second.container).not.toHaveTextContent('matching');
  });

  it('keeps the page when a filter is set to the value it already had', async () => {
    setup({ continent: 'Europe' }, 2);
    await userEvent.selectOptions(continent(), 'Europe');

    expect(probe().page).toBe(2);
  });
});
