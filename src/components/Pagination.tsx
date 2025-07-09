import { useRecoilState, useRecoilValue } from 'recoil';
import { paginationState, filteredCountriesSelector } from '../store/countryStore';
import { PAGINATION_OPTIONS } from '../utils/constants';

interface PaginationProps {
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ className = '' }) => {
  const [pagination, setPagination] = useRecoilState(paginationState);
  const filteredCountries = useRecoilValue(filteredCountriesSelector);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      page: 1 
    }));
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, filteredCountries.length);

  const maxVisiblePages = 5;
  const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className={`flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center ${className}`}>
      {/* Entries per page selector */}
      <div className="flex items-center gap-2 justify-center sm:justify-start">
        <label className="text-sm text-gray-700 whitespace-nowrap">Show</label>
        <select
          value={pagination.limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PAGINATION_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="text-sm text-gray-700 whitespace-nowrap">entries</label>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-700 text-center sm:text-left">
        <span className="whitespace-nowrap">
          Showing {startIndex} to {endIndex} of {filteredCountries.length} entries
        </span>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-2 sm:px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">←</span>
        </button>
        
        <div className="flex gap-1">
          {pagination.totalPages > maxVisiblePages && startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-2 sm:px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-1 text-sm text-gray-500">...</span>
              )}
            </>
          )}
          
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 sm:px-3 py-1 text-sm border rounded-md ${
                page === pagination.page
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          {pagination.totalPages > maxVisiblePages && endPage < pagination.totalPages && (
            <>
              {endPage < pagination.totalPages - 1 && (
                <span className="px-2 py-1 text-sm text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className="px-2 sm:px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {pagination.totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-2 sm:px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>
    </div>
  );
};