import { describe, expect, it } from 'vitest';
import { snapshot_UNSTABLE, type MutableSnapshot, type RecoilValue } from 'recoil';
import {
  countriesState,
  filteredCountriesSelector,
  filtersState,
  loadingState,
  paginatedCountriesSelector,
  paginationState,
  uniqueCurrenciesSelector,
} from '../store/countryStore';
import type { CountryFilters } from '../types/country';
import { countries, makeCountries } from '../test/fixtures';

function read<T>(selector: RecoilValue<T>, init: (s: MutableSnapshot) => void): T {
  return snapshot_UNSTABLE(init).getLoadable(selector).getValue();
}

const filtered = (filters: CountryFilters) =>
  read(filteredCountriesSelector, (s) => {
    s.set(countriesState, countries);
    s.set(filtersState, filters);
  }).map((c) => c.code);

describe('filteredCountriesSelector', () => {
  it('returns everything when no filter is set', () => {
    expect(filtered({})).toHaveLength(countries.length);
  });

  it('filters by continent', () => {
    expect(filtered({ continent: 'Oceania' })).toEqual(['AU', 'NZ']);
  });

  it('filters by currency, including countries with several currencies', () => {
    expect(filtered({ currency: 'EUR' })).toEqual(['FR', 'DE', 'ES']);
    expect(filtered({ currency: 'ZAR' })).toEqual(['ZA', 'LS']);
  });

  it('excludes countries without a currency when a currency filter is set', () => {
    expect(filtered({ currency: 'USD' })).not.toContain('AQ');
  });

  it('keeps countries without a currency when no currency filter is set', () => {
    expect(filtered({ continent: 'Antarctica' })).toEqual(['AQ']);
  });

  describe('search', () => {
    it('matches an exact country code, ignoring case', () => {
      expect(filtered({ search: 'us' })).toContain('US');
      expect(filtered({ search: 'US' })).toContain('US');
    });

    it('does not match part of a country code', () => {
      // "q" is in the code AQ but in no country name
      expect(filtered({ search: 'q' })).toEqual([]);
      expect(filtered({ search: 'aq' })).toEqual(['AQ']);
    });

    it('matches any part of a country name', () => {
      expect(filtered({ search: 'land' })).toEqual(['NZ']);
      expect(filtered({ search: 'ANA' })).toEqual(['CA']);
    });

    it('matches a word inside a name', () => {
      expect(filtered({ search: 'zea' })).toEqual(['NZ']);
      expect(filtered({ search: 'arab' })).toEqual(['AE']);
    });

    it('trims surrounding whitespace', () => {
      expect(filtered({ search: '  canada  ' })).toEqual(['CA']);
    });

    it('returns nothing when nothing matches', () => {
      expect(filtered({ search: 'atlantis' })).toEqual([]);
    });

    it('treats a whitespace-only search like an empty one and matches everything', () => {
      expect(filtered({ search: '   ' })).toHaveLength(countries.length);
    });
  });

  it('combines every filter', () => {
    expect(filtered({ continent: 'Europe', currency: 'EUR', search: 'an' })).toEqual(['FR', 'DE']);
  });
});

describe('paginatedCountriesSelector', () => {
  const page = (pageNumber: number, limit: number, list = makeCountries(25)) =>
    read(paginatedCountriesSelector, (s) => {
      s.set(countriesState, list);
      s.set(paginationState, { page: pageNumber, limit });
    }).map((c) => c.code);

  it('returns the first page', () => {
    expect(page(1, 10)).toEqual(Array.from({ length: 10 }, (_, i) => `C${i}`));
  });

  it('returns the correct slice for a later page', () => {
    expect(page(2, 10)[0]).toBe('C10');
  });

  it('returns a shorter last page', () => {
    expect(page(3, 10)).toEqual(['C20', 'C21', 'C22', 'C23', 'C24']);
  });

  it('returns an empty page beyond the end', () => {
    expect(page(9, 10)).toEqual([]);
  });

  it('paginates the filtered list, not the full one', () => {
    const result = read(paginatedCountriesSelector, (s) => {
      s.set(countriesState, countries);
      s.set(filtersState, { continent: 'Europe' });
      s.set(paginationState, { page: 1, limit: 2 });
    });
    expect(result.map((c) => c.code)).toEqual(['GB', 'FR']);
  });
});

describe('uniqueCurrenciesSelector', () => {
  const currencies = read(uniqueCurrenciesSelector, (s) => s.set(countriesState, countries));

  it('lists each currency once, sorted', () => {
    expect(currencies).toEqual([...new Set(currencies)].sort());
    expect(currencies.filter((x) => x === 'EUR')).toHaveLength(1);
  });

  it('splits countries with several currencies', () => {
    expect(currencies).toContain('LSL');
    expect(currencies).toContain('ZAR');
    expect(currencies).not.toContain('LSL,ZAR');
  });

  it('ignores countries without a currency', () => {
    expect(currencies).not.toContain('null');
    expect(currencies.every((x) => x.length === 3)).toBe(true);
  });

  it('trims whitespace around each currency', () => {
    const result = read(uniqueCurrenciesSelector, (s) =>
      s.set(countriesState, [{ name: 'X', code: 'XX', continent: { name: 'Asia' }, currency: 'AAA, BBB' }]),
    );
    expect(result).toEqual(['AAA', 'BBB']);
  });
});

describe('initial state', () => {
  it('starts out loading, so the first paint is the placeholder and not an empty table', () => {
    expect(read(loadingState, () => {})).toBe(true);
  });
});
