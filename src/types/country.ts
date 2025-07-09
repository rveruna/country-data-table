export interface Continent {
  name: string;
}

export interface Country {
  name: string;
  code: string;
  continent: Continent;
  currency: string | null;
}

export interface CountriesData {
  countries: Country[];
}

export interface ContinentsData {
  continents: Continent[];
}

export interface CountryFilters {
  continent?: string;
  currency?: string;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CountryTableState {
  countries: Country[];
  filteredCountries: Country[];
  filters: CountryFilters;
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
}