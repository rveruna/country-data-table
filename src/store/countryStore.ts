import { atom } from 'jotai';
import { Country, CountryFilters, PaginationInfo, PaginationState } from '../types/country';
import { DEFAULT_PAGINATION } from '../utils/constants';

export const countriesAtom = atom<Country[]>([]);

export const filtersAtom = atom<CountryFilters>({
  continent: undefined,
  currency: undefined,
  search: undefined,
});

export const paginationAtom = atom<PaginationState>(DEFAULT_PAGINATION);

export const loadingAtom = atom<boolean>(true);

export const errorAtom = atom<string | null>(null);

export const filteredCountriesAtom = atom((get) => {
  const countries = get(countriesAtom);
  const filters = get(filtersAtom);

  return countries.filter((country) => {
    const matchesContinent = !filters.continent || country.continent.name === filters.continent;

    const matchesCurrency =
      !filters.currency || (country.currency && country.currency.includes(filters.currency));

    const matchesSearch =
      !filters.search ||
      (() => {
        const searchTerm = filters.search.toLowerCase().trim();
        const countryName = country.name.toLowerCase();
        const countryCode = country.code.toLowerCase();

        // Exact match for country code
        if (countryCode === searchTerm) return true;

        // Any part of the name, which also covers the start of any word in it
        return countryName.includes(searchTerm);
      })();

    return matchesContinent && matchesCurrency && matchesSearch;
  });
});

export const paginatedCountriesAtom = atom((get) => {
  const filteredCountries = get(filteredCountriesAtom);
  const pagination = get(paginationAtom);

  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;

  return filteredCountries.slice(startIndex, endIndex);
});

export const uniqueCurrenciesAtom = atom((get) => {
  const countries = get(countriesAtom);
  const currencySet = new Set<string>();

  countries.forEach((country) => {
    if (country.currency) {
      country.currency.split(',').forEach((currency) => {
        currencySet.add(currency.trim());
      });
    }
  });

  return Array.from(currencySet).sort();
});

export const paginationInfoAtom = atom<PaginationInfo>((get) => {
  const { page, limit } = get(paginationAtom);
  const total = get(filteredCountriesAtom).length;
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
});
