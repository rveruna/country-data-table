import { atom, selector } from 'recoil';
import { Country, CountryFilters, PaginationInfo } from '../types/country';
import { DEFAULT_PAGINATION } from '../utils/constants';

export const countriesState = atom<Country[]>({
  key: 'countriesState',
  default: [],
});

export const filtersState = atom<CountryFilters>({
  key: 'filtersState',
  default: {
    continent: undefined,
    currency: undefined,
    search: undefined,
  },
});

export const paginationState = atom<PaginationInfo>({
  key: 'paginationState',
  default: DEFAULT_PAGINATION,
});

export const loadingState = atom<boolean>({
  key: 'loadingState',
  default: false,
});

export const errorState = atom<string | null>({
  key: 'errorState',
  default: null,
});

export const filteredCountriesSelector = selector({
  key: 'filteredCountriesSelector',
  get: ({ get }) => {
    const countries = get(countriesState);
    const filters = get(filtersState);

    return countries.filter((country) => {
      const matchesContinent = !filters.continent || 
        country.continent.name === filters.continent;
      
      const matchesCurrency = !filters.currency || 
        (country.currency && country.currency.includes(filters.currency));
      
      const matchesSearch = !filters.search || (() => {
        const searchTerm = filters.search.toLowerCase().trim();
        const countryName = country.name.toLowerCase();
        const countryCode = country.code.toLowerCase();
        
        // Exact match for country code
        if (countryCode === searchTerm) return true;
        
        // Fuzzy/similarity search for country name
        if (countryName.includes(searchTerm)) return true;
        
        // Check if search term matches start of any word in country name
        const nameWords = countryName.split(' ');
        if (nameWords.some(word => word.startsWith(searchTerm))) return true;
        
        return false;
      })();

      return matchesContinent && matchesCurrency && matchesSearch;
    });
  },
});

export const paginatedCountriesSelector = selector({
  key: 'paginatedCountriesSelector',
  get: ({ get }) => {
    const filteredCountries = get(filteredCountriesSelector);
    const pagination = get(paginationState);

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    return filteredCountries.slice(startIndex, endIndex);
  },
});

export const uniqueCurrenciesSelector = selector({
  key: 'uniqueCurrenciesSelector',
  get: ({ get }) => {
    const countries = get(countriesState);
    const currencySet = new Set<string>();

    countries.forEach((country) => {
      if (country.currency) {
        country.currency.split(',').forEach((currency) => {
          currencySet.add(currency.trim());
        });
      }
    });

    return Array.from(currencySet).sort();
  },
});