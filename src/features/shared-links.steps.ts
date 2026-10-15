import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { RecoilRoot, useRecoilState } from 'recoil';
import { expect } from 'vitest';
import { loadFeature } from '@amiceli/vitest-cucumber';
import { useUrlState } from '../hooks/useUrlState';
import { filtersState, paginationState } from '../store/countryStore';
import type { CountryFilters, PaginationState } from '../types/country';
import { Steps, runRules } from './support/runRules';

// The URL sync lives in a hook, so these steps render it inside a router, with nothing else on screen.
// Each step runs as its own test and the shared setup cleans up Testing Library renders after every test,
// so the hook is mounted in a root of its own that lasts for the whole scenario.
let root: Root | undefined;
let current: { pagination: PaginationState; filters: CountryFilters; address: string };
let setPagination: (p: PaginationState) => void;
let setFilters: (f: CountryFilters) => void;

function Page() {
  useUrlState();
  const [pagination, setP] = useRecoilState(paginationState);
  const [filters, setF] = useRecoilState(filtersState);
  current = { pagination, filters, address: useLocation().search };
  setPagination = setP;
  setFilters = setF;
  return null;
}

async function open(link: string) {
  await unmount();
  root = createRoot(document.body.appendChild(document.createElement('div')));
  await act(async () =>
    root?.render(
      createElement(
        MemoryRouter,
        { initialEntries: [link] },
        createElement(RecoilRoot, null, createElement(Page)),
      ),
    ),
  );
}

async function unmount() {
  await act(async () => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
}

const steps = new Steps()
  .define('I open the link {string}', open)
  .define('I refresh the page', () => open(`/${current.address}`))
  .define(
    'I choose continent {string}, currency {string} and search {string}',
    (continent: string, currency: string, search: string) =>
      act(async () =>
        setFilters({
          continent: continent || undefined,
          currency: currency || undefined,
          search: search || undefined,
        }),
      ),
  )
  .define('I go to page {int} with {int} rows per page', (page: number, limit: number) =>
    act(async () => setPagination({ page, limit })),
  )
  .define('I see page {int} with {int} rows per page', (page: number, limit: number) => {
    expect(current.pagination).toEqual({ page, limit });
  })
  .define(
    'the filters are continent {string}, currency {string} and search {string}',
    (continent: string, currency: string, search: string) => {
      expect(current.filters).toEqual({
        continent: continent || undefined,
        currency: currency || undefined,
        search: search || undefined,
      });
    },
  )
  .define('the address is {string}', (address: string) => {
    expect(current.address).toBe(address);
  });

runRules(await loadFeature('./shared-links.feature'), steps, { afterEach: unmount });
