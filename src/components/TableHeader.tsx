import { useRecoilValue } from 'recoil';
import { filteredCountriesSelector } from '../store/countryStore';

interface TableHeaderProps {
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className = '' }) => {
  const filteredCountries = useRecoilValue(filteredCountriesSelector);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Country Directory</h2>
          <p className="text-sm text-gray-600 mt-1">
            Browse and search through country information
          </p>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {filteredCountries.length}
          </div>
          <div className="text-sm text-gray-500">
            {filteredCountries.length === 1 ? 'country' : 'countries'} found
          </div>
        </div>
      </div>
    </div>
  );
};