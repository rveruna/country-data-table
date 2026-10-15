import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { filtersAtom, filteredCountriesAtom, countriesAtom } from '../store/countryStore';

interface SearchResultsProps {
  className?: string;
}

const SearchResultsBase: React.FC<SearchResultsProps> = ({ className = '' }) => {
  const filters = useAtomValue(filtersAtom);
  const filteredCountries = useAtomValue(filteredCountriesAtom);
  const allCountries = useAtomValue(countriesAtom);

  if (!filters.search) return null;

  const searchTerm = filters.search.toLowerCase().trim();
  const totalResults = filteredCountries.length;
  const totalCountries = allCountries.length;

  // Find exact code matches
  const exactCodeMatches = filteredCountries.filter((country) => country.code.toLowerCase() === searchTerm);

  // Find name matches that start with search term
  const nameStartMatches = filteredCountries.filter((country) =>
    country.name.toLowerCase().startsWith(searchTerm),
  );

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      {totalResults === 0 ? (
        <div className="text-amber-600">
          No countries found for "{filters.search}". Try a different search term.
        </div>
      ) : (
        <div className="space-y-1">
          <div>
            Found <span className="font-semibold text-blue-600">{totalResults}</span> of {totalCountries}{' '}
            countries matching "{filters.search}"
          </div>

          {exactCodeMatches.length > 0 && (
            <div className="text-green-600">
              ✓ Exact code match: {exactCodeMatches.map((c) => c.name).join(', ')}
            </div>
          )}

          {nameStartMatches.length > 0 && nameStartMatches.length !== totalResults && (
            <div className="text-blue-600">
              ✓ {nameStartMatches.length} countries starting with "{filters.search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SearchResults = memo(SearchResultsBase);
SearchResults.displayName = 'SearchResults';
