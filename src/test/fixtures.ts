import type { Country } from '../types/country';

const c = (name: string, code: string, continent: string, currency: string | null): Country => ({
  name,
  code,
  continent: { name: continent },
  currency,
});

/** 14 countries: three continents with several members, a null currency and a multi-currency entry. */
export const countries: Country[] = [
  c('United States', 'US', 'North America', 'USD'),
  c('Canada', 'CA', 'North America', 'CAD'),
  c('Mexico', 'MX', 'North America', 'MXN'),
  c('United Kingdom', 'GB', 'Europe', 'GBP'),
  c('France', 'FR', 'Europe', 'EUR'),
  c('Germany', 'DE', 'Europe', 'EUR'),
  c('Spain', 'ES', 'Europe', 'EUR'),
  c('Australia', 'AU', 'Oceania', 'AUD'),
  c('New Zealand', 'NZ', 'Oceania', 'NZD'),
  c('Antarctica', 'AQ', 'Antarctica', null),
  c('South Africa', 'ZA', 'Africa', 'ZAR'),
  c('Lesotho', 'LS', 'Africa', 'LSL,ZAR'),
  c('India', 'IN', 'Asia', 'INR'),
  c('United Arab Emirates', 'AE', 'Asia', 'AED'),
];

/** n generated countries, for tests that need many pages. */
export function makeCountries(n: number): Country[] {
  return Array.from({ length: n }, (_, i) =>
    c(`Country ${String(i + 1).padStart(3, '0')}`, `C${i}`, 'Europe', 'EUR'),
  );
}
