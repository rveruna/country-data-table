import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtomValue, useSetAtom } from 'jotai';
import { useUrlState } from '../hooks/useUrlState';
import { filtersAtom, paginationAtom } from '../store/countryStore';
import { renderWithProviders } from '../test/utils';

function Harness() {
  useUrlState();
  const pagination = useAtomValue(paginationAtom);
  const filters = useAtomValue(filtersAtom);
  const setFilters = useSetAtom(filtersAtom);
  const setPagination = useSetAtom(paginationAtom);
  return (
    <div>
      <pre data-testid="state">
        {JSON.stringify({ page: pagination.page, limit: pagination.limit, ...filters })}
      </pre>
      <button onClick={() => setFilters({ continent: 'Europe', currency: 'EUR', search: 'ger' })}>
        set filters
      </button>
      <button onClick={() => setPagination((p) => ({ ...p, page: 4, limit: 50 }))}>set pagination</button>
    </div>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
const url = () => new URLSearchParams(screen.getByTestId('location').textContent ?? '');

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

describe('useUrlState: URL to state', () => {
  it('restores the page, page size and every filter from the URL', async () => {
    renderWithProviders(<Harness />, { route: '/?page=3&limit=20&continent=Europe&currency=EUR&search=ger' });
    await settle();

    expect(state()).toEqual({ page: 3, limit: 20, continent: 'Europe', currency: 'EUR', search: 'ger' });
  });

  it('keeps the page and filters in the URL after restoring them', async () => {
    renderWithProviders(<Harness />, { route: '/?page=3&limit=20&continent=Europe' });
    await settle();

    expect(Object.fromEntries(url())).toEqual({ page: '3', limit: '20', continent: 'Europe' });
  });

  it('falls back to 10 rows for a page size that is not offered', async () => {
    renderWithProviders(<Harness />, { route: '/?limit=7' });
    await settle();

    expect(state().limit).toBe(10);
  });

  it.each(['0', '-2', 'abc'])('falls back to page 1 for page=%s', async (page) => {
    renderWithProviders(<Harness />, { route: `/?page=${page}` });
    await settle();

    expect(state().page).toBe(1);
  });

  it('starts on page 1 with no filters when the URL is empty', async () => {
    renderWithProviders(<Harness />);
    await settle();

    expect(state()).toEqual({ page: 1, limit: 10 });
    expect(url().toString()).toBe('');
  });
});

describe('useUrlState: state to URL', () => {
  it('writes filters to the URL', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByText('set filters'));

    await waitFor(() =>
      expect(Object.fromEntries(url())).toEqual({ continent: 'Europe', currency: 'EUR', search: 'ger' }),
    );
  });

  it('writes the page and page size only when they are not the defaults', async () => {
    renderWithProviders(<Harness />);
    expect(url().toString()).toBe('');

    await userEvent.click(screen.getByText('set pagination'));

    await waitFor(() => expect(Object.fromEntries(url())).toEqual({ page: '4', limit: '50' }));
  });
});
