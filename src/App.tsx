import { useCountries } from './hooks/useCountries';

function App() {
  const { countries, loading, error } = useCountries();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-xl text-gray-600">Loading countries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Country Data Table
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-4">
            Total countries loaded: {countries.length}
          </p>
          <div className="text-sm text-gray-500">
            Apollo GraphQL ✓ | Tailwind CSS ✓ | Formik ✓ | Recoil ✓
          </div>
        </div>
      </div>
    </div>
  );
}

export default App