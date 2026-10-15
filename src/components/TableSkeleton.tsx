interface TableSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * A bar width between min and min + spread percent that varies from row to row and column to column, so the
 * placeholder looks like text. Derived from the position rather than random, so rendering stays pure and the
 * bars do not jump about when the skeleton re-renders.
 */
const barWidth = (row: number, column: number, min: number, spread: number) =>
  `${Math.round(min + ((((row + 1) * 37 + column * 53) % 100) * spread) / 100)}%`;

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 10, className = '' }) => {
  return (
    <div aria-hidden="true" className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b">
              <div className="h-4 bg-gray-300 rounded-sm animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b hidden sm:table-cell">
              <div className="h-4 bg-gray-300 rounded-sm animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b">
              <div className="h-4 bg-gray-300 rounded-sm animate-pulse"></div>
            </th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left border-b hidden md:table-cell">
              <div className="h-4 bg-gray-300 rounded-sm animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div
                  className="h-4 bg-gray-200 rounded-sm mb-2"
                  style={{ width: barWidth(rowIndex, 0, 60, 40) }}
                ></div>
                <div
                  className="h-3 bg-gray-200 rounded-sm sm:hidden"
                  style={{ width: barWidth(rowIndex, 1, 30, 20) }}
                ></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                <div
                  className="h-4 bg-gray-200 rounded-sm"
                  style={{ width: barWidth(rowIndex, 2, 40, 20) }}
                ></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div
                  className="h-4 bg-gray-200 rounded-sm mb-2"
                  style={{ width: barWidth(rowIndex, 3, 50, 30) }}
                ></div>
                <div
                  className="h-3 bg-gray-200 rounded-sm md:hidden"
                  style={{ width: barWidth(rowIndex, 4, 30, 20) }}
                ></div>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                <div
                  className="h-4 bg-gray-200 rounded-sm"
                  style={{ width: barWidth(rowIndex, 5, 35, 25) }}
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
