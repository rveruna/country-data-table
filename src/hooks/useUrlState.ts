import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { paginationState, filtersState } from '../store/countryStore';
import { PAGINATION_OPTIONS } from '../utils/constants';
import type { CountryFilters, PaginationState } from '../types/country';

const DEFAULT_LIMIT = 10;

/** The query string a given page, page size and set of filters should produce. */
function toQuery(pagination: PaginationState, filters: CountryFilters): string {
  const params = new URLSearchParams();
  if (pagination.page > 1) params.set('page', pagination.page.toString());
  if (pagination.limit !== DEFAULT_LIMIT) params.set('limit', pagination.limit.toString());
  if (filters.continent) params.set('continent', filters.continent);
  if (filters.currency) params.set('currency', filters.currency);
  if (filters.search) params.set('search', filters.search);
  return params.toString();
}

/**
 * Keeps the URL and the Recoil state in step.
 *
 * Each effect acts only when the two disagree, and only in one direction:
 * state changes write the URL, URL changes (a shared link, back or forward) read into state.
 * Writing the URL makes it match the state, so it never triggers a read back, and vice versa.
 */
export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useRecoilState(paginationState);
  const [filters, setFilters] = useRecoilState(filtersState);

  const urlQuery = searchParams.toString();
  const stateQuery = toQuery(pagination, filters);
  const latest = useRef({ urlQuery, stateQuery });
  const mounted = useRef(false);

  // Lets the effects below compare against the other side without depending on it. Declared first, so it
  // runs before them in every commit and they see this render's values.
  useEffect(() => {
    latest.current = { urlQuery, stateQuery };
  });

  // State to URL. Skipped on first mount: then the URL is the truth and the state has not read it yet.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (stateQuery !== latest.current.urlQuery) {
      setSearchParams(new URLSearchParams(stateQuery), { replace: true });
    }
  }, [stateQuery, setSearchParams]);

  // URL to state.
  useEffect(() => {
    if (urlQuery === latest.current.stateQuery) return;

    const params = new URLSearchParams(urlQuery);
    const parsedPage = parseInt(params.get('page') ?? '', 10);
    const parsedLimit = parseInt(params.get('limit') ?? '', 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = (PAGINATION_OPTIONS as readonly number[]).includes(parsedLimit)
      ? parsedLimit
      : DEFAULT_LIMIT;
    const continent = params.get('continent') || undefined;
    const currency = params.get('currency') || undefined;
    const search = params.get('search') || undefined;

    // Return the previous object when nothing changed, so subscribers are not notified for nothing
    setPagination((prev) => (prev.page === page && prev.limit === limit ? prev : { ...prev, page, limit }));
    setFilters((prev) =>
      prev.continent === continent && prev.currency === currency && prev.search === search
        ? prev
        : { continent, currency, search },
    );

    // A value that was not valid falls back to its default, which may leave the state unchanged, so the
    // state-to-URL effect would never run. Clean the address here instead.
    const cleaned = toQuery({ page, limit }, { continent, currency, search });
    if (cleaned !== urlQuery) setSearchParams(new URLSearchParams(cleaned), { replace: true });
  }, [urlQuery, setPagination, setFilters, setSearchParams]);
};
