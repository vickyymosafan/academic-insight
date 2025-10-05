import Skeleton from '@/components/ui/Skeleton';

/**
 * Skeleton for Table component
 */
export default function TableSkeleton({ 
  rows = 5, 
  columns = 5 
}: { 
  rows?: number; 
  columns?: number; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid border-b border-gray-200 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="80%" height={20} />
        ))}
      </div>

      {/* Table Rows - Desktop */}
      <div className="hidden md:block">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-b border-gray-100 p-4 hover:bg-gray-50"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="70%" height={16} />
            ))}
          </div>
        ))}
      </div>

      {/* Table Rows - Mobile (Card Layout) */}
      <div className="md:hidden divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4 space-y-3">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Table with Pagination
 */
export function TableWithPaginationSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <TableSkeleton rows={rows} columns={columns} />
      
      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-4">
        <Skeleton variant="text" width={120} height={20} />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={40} height={40} />
          ))}
        </div>
        <Skeleton variant="text" width={120} height={20} />
      </div>
    </div>
  );
}
