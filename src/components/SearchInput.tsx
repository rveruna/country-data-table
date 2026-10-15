import { useState, useEffect, useId, memo } from 'react';
import { useRecoilValue } from 'recoil';
import { filtersState } from '../store/countryStore';
import { useDebounce } from '../hooks/useDebounce';
import { useFilterActions } from '../hooks/useFilterActions';

interface SearchInputProps {
  className?: string;
}

const SearchInputBase: React.FC<SearchInputProps> = ({ className = '' }) => {
  const filters = useRecoilValue(filtersState);
  const updateFilters = useFilterActions();
  const inputId = useId();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update filters when debounced search term changes
  useEffect(() => {
    updateFilters((prev) => ({
      ...prev,
      search: debouncedSearchTerm || undefined,
    }));
  }, [debouncedSearchTerm, updateFilters]);

  // Sync from external changes only (URL, clear filters), adjusting the state while rendering rather than in
  // an effect. Reacting to searchTerm too would reset the text while the user types, because filters.search
  // lags by the debounce.
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    if (filters.search !== searchTerm) {
      setSearchTerm(filters.search || '');
    }
  }

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        Search Countries
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id={inputId}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by country name or code..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-xs text-gray-500">
        Search by country name (e.g., "United States") or exact code (e.g., "US")
      </div>
    </div>
  );
};

export const SearchInput = memo(SearchInputBase);
SearchInput.displayName = 'SearchInput';
