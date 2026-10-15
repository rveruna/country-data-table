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

/** What is stored: the page being shown and how many rows it holds. */
export interface PaginationState {
  page: number;
  limit: number;
}

/** Derived from the stored state and the filtered list, never stored. */
export interface PaginationInfo extends PaginationState {
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