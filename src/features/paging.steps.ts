import { snapshot_UNSTABLE, type RecoilValue } from 'recoil';
import { expect } from 'vitest';
import { loadFeature } from '@amiceli/vitest-cucumber';
import {
  countriesState,
  filtersState,
  paginatedCountriesSelector,
  paginationInfoSelector,
  paginationState,
} from '../store/countryStore';
import type { Country, CountryFilters } from '../types/country';
import { makeCountries } from '../test/fixtures';
import { Steps, runRules } from './support/runRules';

// Bound straight to the paging selectors, with no rendering.
let list: Country[] = [];
let filters: CountryFilters = {};
let pagination = { page: 1, limit: 10 };

function read<T>(selector: RecoilValue<T>): T {
  return snapshot_UNSTABLE((s) => {
    s.set(countriesState, list);
    s.set(filtersState, filters);
    s.set(paginationState, pagination);
  })
    .getLoadable(selector)
    .getValue();
}

// makeCountries names them "Country 001", "Country 002" and so on.
const name = (n: number) => `Country ${String(n).padStart(3, '0')}`;

const steps = new Steps()
  .define('{int} countries', (count: number) => {
    list = makeCountries(count);
    filters = {};
    pagination = { page: 1, limit: 10 };
  })
  .define('I show {int} rows per page', (limit: number) => {
    pagination = { ...pagination, limit };
  })
  .define('I go to page {int}', (page: number) => {
    pagination = { ...pagination, page };
  })
  .define('I search for {string}', (search: string) => {
    filters = { ...filters, search };
  })
  .define(
    'the page shows {int} rows, from country {int} to country {int}',
    (rows: number, first: number, last: number) => {
      const page = read(paginatedCountriesSelector).map((c) => c.name);
      expect(page).toHaveLength(rows);
      expect(page[0]).toBe(name(first));
      expect(page[page.length - 1]).toBe(name(last));
    },
  )
  .define('there are {int} pages', (pages: number) => {
    expect(read(paginationInfoSelector).totalPages).toBe(pages);
  })
  .define('there are {int} matching countries on {int} pages', (total: number, pages: number) => {
    expect(read(paginationInfoSelector)).toMatchObject({ total, totalPages: pages });
  });

runRules(await loadFeature('./paging.feature'), steps);
