import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { SearchResults } from '../components/SearchResults';
import { countriesAtom, filtersAtom } from '../store/countryStore';
import { countries } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';

const setup = (search: string | undefined) =>
  renderWithProviders(<SearchResults />, {
    initializeState: (s) => {
      s.set(countriesAtom, countries);
      s.set(filtersAtom, { search });
    },
  });

describe('SearchResults', () => {
  it('renders nothing without a search', () => {
    setup(undefined);
    expect(screen.queryByText(/countries/)).not.toBeInTheDocument();
    expect(screen.queryByText(/No countries found/)).not.toBeInTheDocument();
  });

  it('reports how many countries match', () => {
    const { container } = setup('us');
    expect(container).toHaveTextContent(`Found 2 of ${countries.length} countries matching "us"`);
  });

  it('calls out an exact country code match by name', () => {
    const { container } = setup('us');
    expect(container).toHaveTextContent('✓ Exact code match: United States');
  });

  it('counts countries whose name starts with the search, when that is not every match', () => {
    const startingWithA = countries.filter((c) => c.name.toLowerCase().startsWith('a')).length;
    const { container } = setup('a');

    expect(container).toHaveTextContent(`✓ ${startingWithA} countries starting with "a"`);
  });

  it('leaves out the "starting with" line when every match starts with the search', () => {
    const { container } = setup('new');
    expect(container).not.toHaveTextContent('starting with');
  });

  it('says so when nothing matches', () => {
    const { container } = setup('zzz');
    expect(container).toHaveTextContent('No countries found for "zzz". Try a different search term.');
    expect(container).not.toHaveTextContent('Found');
  });
});
