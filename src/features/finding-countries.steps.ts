import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act, fireEvent, within } from '@testing-library/react';
import { createStore, Provider, useAtomValue } from 'jotai';
import { expect, vi } from 'vitest';
import { loadFeature } from '@amiceli/vitest-cucumber';
import { SearchInput } from '../components/SearchInput';
import { countriesAtom, filteredCountriesAtom, filtersAtom } from '../store/countryStore';
import type { CountryFilters } from '../types/country';
import { countries } from '../test/fixtures';
import { Steps, runRules } from './support/runRules';

// Search and filters: bound straight to the filtering atom through a store, with no rendering.
let filters: CountryFilters = {};

function shown() {
  const store = createStore();
  store.set(countriesAtom, countries);
  store.set(filtersAtom, filters);
  return store.get(filteredCountriesAtom).map((c) => c.code);
}

const codes = (list: string) => (list ? list.split(',').map((c) => c.trim()) : []);

// Debounce: the 300 ms wait lives in the search box component, so these steps render it and query it with
// Testing Library. Each step runs as its own test and the shared setup cleans up Testing Library renders after
// every test, so the box is mounted in a root of its own that lasts for the whole scenario.
let root: Root | undefined;
let screen: ReturnType<typeof within>;

function AppliedSearch() {
  return createElement('output', { 'data-testid': 'applied' }, useAtomValue(filtersAtom).search ?? '');
}

const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function unmount() {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  vi.useRealTimers();
}

const steps = new Steps()
  .define('the list of countries', () => {
    filters = {};
  })
  .define('I search for {string}', (search: string) => {
    filters = { ...filters, search: search || undefined };
  })
  .define('I choose the continent {string}', (continent: string) => {
    filters = { ...filters, continent };
  })
  .define('I choose the currency {string}', (currency: string) => {
    filters = { ...filters, currency };
  })
  .define('the table shows {string}', (list: string) => {
    expect(shown()).toEqual(codes(list));
  })
  .define('the table shows all {int} countries', (count: number) => {
    expect(shown()).toHaveLength(count);
  })
  .define('the search box is on screen', () => {
    vi.useFakeTimers();
    const container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
    act(() =>
      root?.render(createElement(Provider, null, createElement(SearchInput), createElement(AppliedSearch))),
    );
    screen = within(container);
  })
  .define('I type {string} and wait {int} ms', (text: string, ms: number) => {
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Countries' }), { target: { value: text } });
    wait(ms);
  })
  .define('I wait {int} ms', (ms: number) => wait(ms))
  .define('the search applied is {string}', (search: string) => {
    expect(screen.getByTestId('applied').textContent).toBe(search);
  });

runRules(await loadFeature('./finding-countries.feature'), steps, { afterEach: unmount });
