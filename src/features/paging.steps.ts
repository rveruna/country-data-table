import { createStore, type Atom } from 'jotai';
import { expect } from 'vitest';
import { loadFeature } from '@amiceli/vitest-cucumber';
import {
  countriesAtom,
  filtersAtom,
  paginatedCountriesAtom,
  paginationInfoAtom,
  paginationAtom,
} from '../store/countryStore';
import type { Country, CountryFilters } from '../types/country';
import { makeCountries } from '../test/fixtures';
import { Steps, runRules } from './support/runRules';

// Bound straight to the paging atoms through a store, with no rendering.
let list: Country[] = [];
let filters: CountryFilters = {};
let pagination = { page: 1, limit: 10 };

function read<T>(target: Atom<T>): T {
  const store = createStore();
  store.set(countriesAtom, list);
  store.set(filtersAtom, filters);
  store.set(paginationAtom, pagination);
  return store.get(target);
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
      const page = read(paginatedCountriesAtom).map((c) => c.name);
      expect(page).toHaveLength(rows);
      expect(page[0]).toBe(name(first));
      expect(page[page.length - 1]).toBe(name(last));
    },
  )
  .define('there are {int} pages', (pages: number) => {
    expect(read(paginationInfoAtom).totalPages).toBe(pages);
  })
  .define('there are {int} matching countries on {int} pages', (total: number, pages: number) => {
    expect(read(paginationInfoAtom)).toMatchObject({ total, totalPages: pages });
  });

runRules(await loadFeature('./paging.feature'), steps);
