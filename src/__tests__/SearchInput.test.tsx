import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SearchInput } from '../components/SearchInput';
import { filtersState, paginationState } from '../store/countryStore';
import { renderWithProviders } from '../test/utils';

function Probe() {
  const filters = useRecoilValue(filtersState);
  const pagination = useRecoilValue(paginationState);
  const setFilters = useSetRecoilState(filtersState);
  return (
    <div>
      <div data-testid="search">{filters.search ?? ''}</div>
      <div data-testid="page">{pagination.page}</div>
      <button onClick={() => setFilters({ search: 'peru' })}>set from outside</button>
    </div>
  );
}

const input = () => screen.getByPlaceholderText('Search by country name or code...') as HTMLInputElement;
const search = () => screen.getByTestId('search').textContent;
const advance = (ms: number) => act(async () => void vi.advanceTimersByTime(ms));

describe('SearchInput', () => {
  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  function setup(initialPage = 1) {
    return renderWithProviders(
      <>
        <SearchInput />
        <Probe />
      </>,
      { initializeState: (s) => s.set(paginationState, { page: initialPage, limit: 10 }) },
    );
  }

  it('links the visible label to the input', () => {
    setup();
    expect(screen.getByLabelText('Search Countries')).toBe(input());
  });

  it('waits for typing to pause (300 ms) before updating the filter', async () => {
    setup();
    await user().type(input(), 'ger');

    expect(search()).toBe('');
    await advance(200);
    expect(search()).toBe('');
    await advance(200);
    expect(search()).toBe('ger');
  });

  it('restarts the wait on every keystroke', async () => {
    setup();
    const u = user();
    await u.type(input(), 'g');
    await advance(200);
    await u.type(input(), 'e');
    await advance(200);

    expect(search()).toBe('');
    await advance(150);
    expect(search()).toBe('ge');
  });

  it('shows the clear button only when there is text', async () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await user().type(input(), 'a');
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('clears the text and then the filter', async () => {
    setup();
    const u = user();
    await u.type(input(), 'abc');
    await advance(400);
    expect(search()).toBe('abc');

    await u.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input().value).toBe('');
    await advance(400);
    expect(search()).toBe('');
  });

  it('shows a search that is set from outside, such as from the URL', async () => {
    setup();
    await user().click(screen.getByText('set from outside'));

    expect(input().value).toBe('peru');
  });

  it('returns to page 1 when the search changes', async () => {
    setup(4);
    await user().type(input(), 'fr');
    await advance(400);

    expect(screen.getByTestId('page').textContent).toBe('1');
  });

  it('does not touch the page when nothing was typed', async () => {
    setup(4);
    await advance(1000);

    expect(screen.getByTestId('page').textContent).toBe('4');
  });
});
