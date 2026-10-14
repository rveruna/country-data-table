import { useRecoilCallback } from 'recoil';
import { filtersState, paginationState } from '../store/countryStore';
import type { CountryFilters } from '../types/country';

type FilterUpdate = CountryFilters | ((prev: CountryFilters) => CountryFilters);

const sameFilters = (a: CountryFilters, b: CountryFilters) =>
  a.continent === b.continent && a.currency === b.currency && a.search === b.search;

/**
 * Updates the filters and returns to page 1, but only when a filter really changes.
 * Restoring filters from the URL does not go through here, so a shared link keeps its page.
 */
export function useFilterActions() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (update: FilterUpdate) => {
        const previous = snapshot.getLoadable(filtersState).getValue();
        const next = typeof update === 'function' ? update(previous) : update;
        if (sameFilters(previous, next)) return;

        set(filtersState, next);
        set(paginationState, (p) => (p.page === 1 ? p : { ...p, page: 1 }));
      },
    [],
  );
}
