import { createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { createStore, Provider, type Store } from 'jotai';
import { expect } from 'vitest';
import { loadFeature } from '@amiceli/vitest-cucumber';
import { useUrlState } from '../hooks/useUrlState';
import { filtersAtom, paginationAtom } from '../store/countryStore';
import { Steps, runRules } from './support/runRules';

// The URL sync lives in a hook, so these steps render it inside a router, with nothing else on screen.
// Each step runs as its own test and the shared setup cleans up Testing Library renders after every test,
// so the hook is mounted in a root of its own that lasts for the whole scenario. The steps read and set the
// state through that render's store, so only the address has to come from the page.
let root: Root | undefined;
let store: Store;
let address = '';

function Page() {
  useUrlState();
  const { search } = useLocation();
  // Hands the address to the steps once the page commits. Writing outside the component belongs in an effect.
  useEffect(() => {
    address = search;
  });
  return null;
}

async function open(link: string) {
  await unmount();
  store = createStore();
  root = createRoot(document.body.appendChild(document.createElement('div')));
  await act(async () =>
    root?.render(
      createElement(
        MemoryRouter,
        { initialEntries: [link] },
        createElement(Provider, { store }, createElement(Page)),
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
  .define('I refresh the page', () => open(`/${address}`))
  .define(
    'I choose continent {string}, currency {string} and search {string}',
    (continent: string, currency: string, search: string) =>
      act(async () =>
        store.set(filtersAtom, {
          continent: continent || undefined,
          currency: currency || undefined,
          search: search || undefined,
        }),
      ),
  )
  .define('I go to page {int} with {int} rows per page', (page: number, limit: number) =>
    act(async () => store.set(paginationAtom, { page, limit })),
  )
  .define('I see page {int} with {int} rows per page', (page: number, limit: number) => {
    expect(store.get(paginationAtom)).toEqual({ page, limit });
  })
  .define(
    'the filters are continent {string}, currency {string} and search {string}',
    (continent: string, currency: string, search: string) => {
      expect(store.get(filtersAtom)).toEqual({
        continent: continent || undefined,
        currency: currency || undefined,
        search: search || undefined,
      });
    },
  )
  .define('the address is {string}', (expected: string) => {
    expect(address).toBe(expected);
  });

runRules(await loadFeature('./shared-links.feature'), steps, { afterEach: unmount });
