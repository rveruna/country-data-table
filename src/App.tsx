import { useCountries } from './hooks/useCountries';
import { CountryTable } from './components/CountryTable';
import { TableHeader } from './components/TableHeader';

function App() {
  const { countries, loading, error } = useCountries();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-xl text-gray-600">Loading countries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-xl text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Country Data Table
        </h1>
        
        <TableHeader className="mb-6" />
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <CountryTable />
          <div className="border-t border-gray-200 p-4 text-center text-gray-500">
            Showing first 10 countries
          </div>
        </div>
      </div>
    </div>
  );
}

export default App