import { useRecoilValue } from 'recoil';
import { paginatedCountriesSelector } from '../store/countryStore';
import { Country } from '../types/country';

interface CountryTableProps {
  className?: string;
}

export const CountryTable: React.FC<CountryTableProps> = ({ className = '' }) => {
  const paginatedCountries = useRecoilValue(paginatedCountriesSelector);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Country Name
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b hidden sm:table-cell">
              Country Code
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Continent
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b hidden md:table-cell">
              Currency
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedCountries.map((country: Country) => (
            <tr key={country.code} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">{country.name}</span>
                  <span className="text-xs text-gray-500 font-mono sm:hidden mt-1">
                    {country.code}
                  </span>
                </div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 font-mono hidden sm:table-cell">
                {country.code}
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500">
                <div className="flex flex-col">
                  <span>{country.continent.name}</span>
                  <span className="text-xs text-gray-400 md:hidden mt-1">
                    {country.currency || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                {country.currency || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {paginatedCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No countries found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search terms
          </div>
        </div>
      )}
    </div>
  );
};