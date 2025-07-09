import { useRecoilValue } from 'recoil';
import { countriesState } from '../store/countryStore';
import { Country } from '../types/country';

interface CountryTableProps {
  className?: string;
}

export const CountryTable: React.FC<CountryTableProps> = ({ className = '' }) => {
  const countries = useRecoilValue(countriesState);
  
  // For now, just show first 10 countries (basic display)
  const displayedCountries = countries.slice(0, 10);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Country Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Country Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Continent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Currency
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayedCountries.map((country: Country) => (
            <tr key={country.code} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {country.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {country.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {country.continent.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {country.currency || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {displayedCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No countries found</div>
        </div>
      )}
    </div>
  );
};