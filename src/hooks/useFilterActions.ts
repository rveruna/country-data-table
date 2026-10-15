import { atom, useSetAtom } from 'jotai';
import { filtersAtom, paginationAtom } from '../store/countryStore';
import type { CountryFilters } from '../types/country';

type FilterUpdate = CountryFilters | ((prev: CountryFilters) => CountryFilters);

const sameFilters = (a: CountryFilters, b: CountryFilters) =>
  a.continent === b.continent && a.currency === b.currency && a.search === b.search;

// A write-only atom: it reads the filters when called, so components that use it do not subscribe to them
const updateFiltersAtom = atom(null, (get, set, update: FilterUpdate) => {
  const previous = get(filtersAtom);
  const next = typeof update === 'function' ? update(previous) : update;
  if (sameFilters(previous, next)) return;

  set(filtersAtom, next);
  set(paginationAtom, (p) => (p.page === 1 ? p : { ...p, page: 1 }));
});

/**
 * Updates the filters and returns to page 1, but only when a filter really changes.
 * Restoring filters from the URL does not go through here, so a shared link keeps its page.
 */
export function useFilterActions() {
  return useSetAtom(updateFiltersAtom);
}
