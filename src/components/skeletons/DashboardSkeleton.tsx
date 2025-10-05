import { StatCardsGridSkeleton } from './StatCardSkeleton';
import ChartSkeleton, { PieChartSkeleton } from './ChartSkeleton';
import { TableWithPaginationSkeleton } from './TableSkeleton';

/**
 * Complete Dashboard Skeleton
 * Shows loading state for the entire dashboard page
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Statistics Cards */}
      <StatCardsGridSkeleton count={4} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={300} />
        <PieChartSkeleton />
      </div>

      {/* Additional Chart */}
      <ChartSkeleton height={250} />

      {/* Data Table */}
      <TableWithPaginationSkeleton rows={5} columns={6} />
    </div>
  );
}
