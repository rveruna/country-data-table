import { useRecoilValue } from 'recoil';
import { countriesState } from '../store/countryStore';

interface TableHeaderProps {
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className = '' }) => {
  const countries = useRecoilValue(countriesState);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Country Directory</h2>
          <p className="text-sm text-gray-600 mt-1">
            Browse and search through country information
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {countries.length}
          </div>
          <div className="text-sm text-gray-500">
            {countries.length === 1 ? 'country' : 'countries'} loaded
          </div>
        </div>
      </div>
    </div>
  );
};