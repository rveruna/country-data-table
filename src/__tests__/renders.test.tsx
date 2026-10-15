import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler, type ComponentType } from 'react';
import App from '../App';
import { countries } from '../test/fixtures';
import { countriesQueryMock, renderWithProviders } from '../test/utils';

/**
 * Render budget: how many times each component renders per interaction.
 * Before this work, choosing a continent rendered each of these components 5 times and clicking Next
 * rendered each of them 4 times. The causes were a top-level component subscribed to almost all state,
 * a URL/state sync that echoed, and page totals copied into state by an effect instead of derived.
 */
const counts: Record<string, number> = {};

// The wrapper is deliberately not memoised: it renders whenever its parent does, and the Profiler inside
// reports that render. So a count above the budget means the parent re-rendered or the component updated.
function counted<P extends object>(name: string, Real: ComponentType<P>) {
  return (props: P) => (
    <Profiler id={name} onRender={() => void (counts[name] = (counts[name] ?? 0) + 1)}>
      <Real {...props} />
    </Profiler>
  );
}

vi.mock('../components/CountryTable', async (orig) => {
  const m = await orig<{ CountryTable: ComponentType }>();
  return { ...m, CountryTable: counted('CountryTable', m.CountryTable) };
});
vi.mock('../components/Pagination', async (orig) => {
  const m = await orig<{ Pagination: ComponentType }>();
  return { ...m, Pagination: counted('Pagination', m.Pagination) };
});
vi.mock('../components/TableHeader', async (orig) => {
  const m = await orig<{ TableHeader: ComponentType }>();
  return { ...m, TableHeader: counted('TableHeader', m.TableHeader) };
});
vi.mock('../components/FilterControls', async (orig) => {
  const m = await orig<{ FilterControls: ComponentType }>();
  return { ...m, FilterControls: counted('FilterControls', m.FilterControls) };
});

const renders = (name: string) => counts[name] ?? 0;
const reset = () => Object.keys(counts).forEach((k) => delete counts[k]);

describe('render budget', () => {
  beforeEach(async () => {
    reset();
    renderWithProviders(<App />, { mocks: [countriesQueryMock(countries)] });
    await screen.findByText('United States');
    await act(async () => void (await new Promise((r) => setTimeout(r, 50))));
    reset();
  });

  it('renders the header, table and pagination once when a continent is chosen', async () => {
    await userEvent.selectOptions(screen.getByLabelText('Continent'), 'Europe');

    expect(renders('TableHeader')).toBe(1);
    expect(renders('CountryTable')).toBe(1);
    expect(renders('Pagination')).toBe(1);
    // the filter panel holds the dropdowns and the search box, which update with it
    expect(renders('FilterControls')).toBeLessThanOrEqual(2);
  });

  it('re-renders only the table and the pagination when the page changes', async () => {
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(renders('CountryTable')).toBe(1);
    expect(renders('Pagination')).toBe(1);
    expect(renders('TableHeader')).toBe(0);
    expect(renders('FilterControls')).toBe(0);
  });

  it('does not re-render the table or header while typing, only once the search is applied', async () => {
    await userEvent.type(screen.getByLabelText('Search Countries'), 'germany');
    expect(renders('CountryTable')).toBe(0);
    expect(renders('TableHeader')).toBe(0);

    expect(await screen.findByText(/Found/)).toBeInTheDocument();
    expect(renders('TableHeader')).toBe(1);
    expect(renders('CountryTable')).toBeLessThanOrEqual(2);
  });
});
