import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { filtersAtom, uniqueCurrenciesAtom } from '../store/countryStore';
import { FilterDropdown } from './FilterDropdown';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { CONTINENTS } from '../utils/constants';
import { useFilterActions } from '../hooks/useFilterActions';

interface FilterControlsProps {
  className?: string;
}

const FilterControlsBase: React.FC<FilterControlsProps> = ({ className = '' }) => {
  const filters = useAtomValue(filtersAtom);
  const updateFilters = useFilterActions();
  const uniqueCurrencies = useAtomValue(uniqueCurrenciesAtom);

  const handleContinentChange = (continent: string | undefined) => {
    updateFilters((prev) => ({ ...prev, continent }));
  };

  const handleCurrencyChange = (currency: string | undefined) => {
    updateFilters((prev) => ({ ...prev, currency }));
  };

  const clearFilters = () => {
    updateFilters({
      continent: undefined,
      currency: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = filters.continent || filters.currency || filters.search;

  return (
    <div className={`bg-white rounded-lg shadow-xs border border-gray-200 p-3 sm:p-4 ${className}`}>
      <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
        <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-4">
          <SearchInput className="flex-1" />

          <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
            <FilterDropdown
              label="Continent"
              value={filters.continent}
              options={CONTINENTS}
              onChange={handleContinentChange}
              placeholder="All Continents"
              className="flex-1"
            />

            <FilterDropdown
              label="Currency"
              value={filters.currency}
              options={uniqueCurrencies}
              onChange={handleCurrencyChange}
              placeholder="All Currencies"
              className="flex-1"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-center lg:justify-start lg:items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {filters.search && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <SearchResults />
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {filters.continent && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <span className="hidden sm:inline">Continent: </span>
                {filters.continent}
                <button
                  onClick={() => handleContinentChange(undefined)}
                  aria-label={`Remove ${filters.continent} filter`}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.currency && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="hidden sm:inline">Currency: </span>
                {filters.currency}
                <button
                  onClick={() => handleCurrencyChange(undefined)}
                  aria-label={`Remove ${filters.currency} filter`}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <span className="hidden sm:inline">Search: </span>
                <span className="max-w-24 sm:max-w-none truncate">{filters.search}</span>
                <button
                  onClick={() => updateFilters((prev) => ({ ...prev, search: undefined }))}
                  aria-label={`Remove search "${filters.search}"`}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterControls = memo(FilterControlsBase);
FilterControls.displayName = 'FilterControls';
