import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { countries } from '../test/fixtures';
import { countriesErrorMock, countriesQueryMock, renderWithProviders } from '../test/utils';

const renderApp = (route = '/') => renderWithProviders(<App />, { route, mocks: [countriesQueryMock(countries)] });

/** Rows in the table body, excluding the header row. */
const bodyRowCount = () => screen.getAllByRole('row').length - 1;
const url = () => new URLSearchParams(screen.getByTestId('location').textContent ?? '');
const loaded = () => screen.findByText('United States');

describe('App: loading and errors', () => {
  it('shows placeholders while the countries load, then the table', async () => {
    renderApp();
    expect(screen.getByText('Loading country information...')).toBeInTheDocument();

    await loaded();
    expect(screen.queryByText('Loading country information...')).not.toBeInTheDocument();
  });

  it('shows the first page of countries and the total once loaded', async () => {
    renderApp();
    await loaded();

    expect(bodyRowCount()).toBe(10);
    expect(screen.getByText(String(countries.length))).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 14 entries')).toBeInTheDocument();
  });

  it('shows an error with the reason when the request fails', async () => {
    renderWithProviders(<App />, { mocks: [countriesErrorMock('Network down')] });

    expect(await screen.findByText('Failed to load countries')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('requests the countries again when "Try Again" is pressed', async () => {
    renderWithProviders(<App />, { mocks: [countriesErrorMock('Network down'), countriesQueryMock(countries)] });

    await userEvent.click(await screen.findByRole('button', { name: 'Try Again' }));

    expect(await screen.findByText('United States')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load countries')).not.toBeInTheDocument();
  });
});

describe('App: filtering and searching', () => {
  it('filters by continent and records it in the URL', async () => {
    renderApp();
    await loaded();

    await userEvent.selectOptions(screen.getByLabelText('Continent'), 'Europe');

    expect(bodyRowCount()).toBe(4);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
    expect(url().get('continent')).toBe('Europe');
  });

  it('filters by currency', async () => {
    renderApp();
    await loaded();

    await userEvent.selectOptions(screen.getByLabelText('Currency'), 'ZAR');

    expect(bodyRowCount()).toBe(2); // South Africa and Lesotho, which has two currencies
  });

  it('searches by name once typing pauses, and records it in the URL', async () => {
    renderApp();
    await loaded();

    await userEvent.type(screen.getByLabelText('Search Countries'), 'ger');

    await waitFor(() => expect(bodyRowCount()).toBe(1));
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(url().get('search')).toBe('ger');
    expect(screen.getByText(/Found/)).toHaveTextContent('Found 1 of 14 countries matching "ger"');
  });

  it('finds a country by its exact code', async () => {
    renderApp();
    await loaded();

    await userEvent.type(screen.getByLabelText('Search Countries'), 'nz');

    await waitFor(() => expect(bodyRowCount()).toBe(1));
    expect(screen.getByText('New Zealand')).toBeInTheDocument();
  });

  it('says so when nothing matches, and offers to clear', async () => {
    renderApp();
    await loaded();

    await userEvent.type(screen.getByLabelText('Search Countries'), 'atlantis');

    expect(await screen.findByText('No countries found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('brings everything back when the filters are cleared', async () => {
    renderApp();
    await loaded();
    await userEvent.selectOptions(screen.getByLabelText('Continent'), 'Oceania');
    expect(bodyRowCount()).toBe(2);

    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));

    expect(bodyRowCount()).toBe(10);
    expect(url().toString()).toBe('');
  });
});

describe('App: paging', () => {
  it('moves to the next page and records it in the URL', async () => {
    renderApp();
    await loaded();

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Showing 11 to 14 of 14 entries')).toBeInTheDocument();
    expect(bodyRowCount()).toBe(4);
    expect(url().get('page')).toBe('2');
  });

  it('changes how many rows each page shows', async () => {
    renderApp();
    await loaded();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show' }), '20');

    expect(bodyRowCount()).toBe(14);
    expect(url().get('limit')).toBe('20');
  });

  it('returns to page 1 when a filter changes while on a later page', async () => {
    renderApp();
    await loaded();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(url().get('page')).toBe('2');

    await userEvent.selectOptions(screen.getByLabelText('Continent'), 'Europe');

    expect(screen.getByText('Showing 1 to 4 of 4 entries')).toBeInTheDocument();
    expect(url().has('page')).toBe(false);
  });
});

describe('App: opening a shared link', () => {
  it('restores the page after the countries have loaded', async () => {
    renderApp('/?page=2');

    expect(await screen.findByText('Showing 11 to 14 of 14 entries')).toBeInTheDocument();
    expect(bodyRowCount()).toBe(4);
    expect(url().get('page')).toBe('2');
  });

  it('restores the filters and applies them to the data', async () => {
    renderApp('/?continent=Asia&currency=INR');
    await screen.findByText('India');

    expect(bodyRowCount()).toBe(1);
    expect(screen.getByLabelText('Continent')).toHaveValue('Asia');
    expect(screen.getByLabelText('Currency')).toHaveValue('INR');
  });

  it('restores a search into the search box', async () => {
    renderApp('/?search=ger');
    await screen.findByText('Germany');

    expect(screen.getByLabelText('Search Countries')).toHaveValue('ger');
    expect(bodyRowCount()).toBe(1);
  });

  it('keeps the page together with the filters', async () => {
    renderApp('/?limit=20&continent=Europe&page=1');
    await screen.findByText('Germany');

    expect(bodyRowCount()).toBe(4);
    expect(url().get('limit')).toBe('20');
  });

  it('falls back to the last page that exists when the page is out of range', async () => {
    renderApp('/?page=9');
    await loaded();

    await waitFor(() => expect(screen.getByText('Showing 1 to 10 of 14 entries')).toBeInTheDocument());
  });
});
