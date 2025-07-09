import { useCountries } from './hooks/useCountries';
import { useUrlState } from './hooks/useUrlState';
import { CountryTable } from './components/CountryTable';
import { Pagination } from './components/Pagination';
import { TableHeader } from './components/TableHeader';
import { FilterControls } from './components/FilterControls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingState } from './components/LoadingState';
import { ErrorAlert } from './components/ErrorAlert';
import { TableSkeleton } from './components/TableSkeleton';
import { NetworkStatus } from './components/NetworkStatus';

function App() {
  const { countries, loading, error, refetch } = useCountries();
  useUrlState(); // Initialize URL state synchronization

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Country Data Table
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Country Directory</h2>
                <p className="text-sm text-gray-600 mt-1">Loading country information...</p>
              </div>
              <div className="text-right">
                <div className="animate-pulse bg-gray-200 rounded h-8 w-16 mb-2"></div>
                <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 rounded h-10 w-full"></div>
              <div className="flex space-x-4">
                <div className="bg-gray-200 rounded h-10 flex-1"></div>
                <div className="bg-gray-200 rounded h-10 flex-1"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <TableSkeleton rows={10} />
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="animate-pulse bg-gray-200 rounded h-8 w-32"></div>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-48"></div>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Country Data Table
          </h1>
          
          <ErrorAlert
            title="Failed to load countries"
            message={error}
            onRetry={() => window.location.reload()}
            className="mb-6"
          />
          
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No data available</h2>
            <p className="text-gray-600">Unable to load country information at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkStatus />
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:py-8 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center px-4">
            Country Data Table
          </h1>
          
          <TableHeader className="mb-4 sm:mb-6 mx-2 sm:mx-0" />
          
          <FilterControls className="mb-4 sm:mb-6 mx-2 sm:mx-0" />
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2 sm:mx-0">
            <CountryTable />
            <div className="border-t border-gray-200 p-2 sm:p-4">
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App