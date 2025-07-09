interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 10, 
  columns = 4,
  className = ""
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b hidden sm:table-cell">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b hidden md:table-cell">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="h-4 bg-gray-200 rounded mb-2" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                <div className="h-3 bg-gray-200 rounded sm:hidden" style={{ width: `${Math.random() * 20 + 30}%` }}></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                <div className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 20 + 40}%` }}></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="h-4 bg-gray-200 rounded mb-2" style={{ width: `${Math.random() * 30 + 50}%` }}></div>
                <div className="h-3 bg-gray-200 rounded md:hidden" style={{ width: `${Math.random() * 20 + 30}%` }}></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                <div className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 25 + 35}%` }}></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};