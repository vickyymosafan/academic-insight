import Skeleton from '@/components/ui/Skeleton';

/**
 * Skeleton for Chart components
 */
export default function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Skeleton variant="text" width="40%" height={24} className="mb-6" />
      
      <div className="space-y-4">
        {/* Chart bars/lines simulation */}
        <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              className="flex-1"
              height={`${Math.random() * 60 + 40}%`}
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} variant="text" width={40} height={16} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Pie/Donut Chart
 */
export function PieChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Skeleton variant="text" width="40%" height={24} className="mb-6" />
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <Skeleton variant="circular" width={200} height={200} />
        
        <div className="space-y-3 w-full md:w-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton variant="rectangular" width={16} height={16} />
              <Skeleton variant="text" width={120} height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
