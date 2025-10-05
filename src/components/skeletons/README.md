# Skeleton Components Usage Guide

## Overview
Skeleton components provide loading placeholders that improve perceived performance and user experience.

## Available Components

### 1. Base Skeleton
```tsx
import Skeleton from '@/components/ui/Skeleton';

<Skeleton variant="text" width="80%" height={20} />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" width={200} height={100} />
```

### 2. Loading Spinners
```tsx
import LoadingSpinner, { FullPageLoader, InlineLoader } from '@/components/ui/LoadingSpinner';

// Basic spinner
<LoadingSpinner size="md" color="primary" />

// Full page loader
<FullPageLoader label="Memuat data..." />

// Inline loader
<InlineLoader label="Memuat..." />
```

### 3. Stat Card Skeleton
```tsx
import { StatCardSkeleton, StatCardsGridSkeleton } from '@/components/skeletons';

// Single card
<StatCardSkeleton />

// Grid of cards
<StatCardsGridSkeleton count={4} />
```

### 4. Chart Skeletons
```tsx
import ChartSkeleton, { PieChartSkeleton } from '@/components/skeletons';

// Bar/Line chart skeleton
<ChartSkeleton height={300} />

// Pie chart skeleton
<PieChartSkeleton />
```

### 5. Table Skeleton
```tsx
import { TableSkeleton, TableWithPaginationSkeleton } from '@/components/skeletons';

// Basic table
<TableSkeleton rows={5} columns={6} />

// Table with pagination
<TableWithPaginationSkeleton rows={10} columns={6} />
```

### 6. Dashboard Skeleton
```tsx
import DashboardSkeleton from '@/components/skeletons';

// Complete dashboard loading state
<DashboardSkeleton />
```

### 7. Loading State Wrapper
```tsx
import LoadingState, { ButtonLoading } from '@/components/ui/LoadingState';

// With skeleton
<LoadingState 
  isLoading={isLoading} 
  skeleton={<DashboardSkeleton />}
>
  <DashboardContent />
</LoadingState>

// With spinner
<LoadingState 
  isLoading={isLoading} 
  variant="spinner"
  loadingText="Memuat data..."
>
  <Content />
</LoadingState>

// Button loading
<button disabled={isLoading}>
  <ButtonLoading isLoading={isLoading} loadingText="Menyimpan...">
    Simpan Data
  </ButtonLoading>
</button>
```

## Hooks

### useLoadingState
```tsx
import { useLoadingState } from '@/hooks/useLoadingState';

function MyComponent() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState();

  const fetchData = async () => {
    await withLoading(async () => {
      const response = await fetch('/api/data');
      const data = await response.json();
      return data;
    });
  };

  return (
    <LoadingState isLoading={isLoading} skeleton={<TableSkeleton />}>
      <DataTable />
    </LoadingState>
  );
}
```

### useMultipleLoadingStates
```tsx
import { useMultipleLoadingStates } from '@/hooks/useLoadingState';

function MyComponent() {
  const { loadingStates, startLoading, stopLoading } = useMultipleLoadingStates([
    'stats',
    'charts',
    'table'
  ]);

  return (
    <>
      <LoadingState isLoading={loadingStates.stats} skeleton={<StatCardsGridSkeleton />}>
        <StatsCards />
      </LoadingState>
      
      <LoadingState isLoading={loadingStates.charts} skeleton={<ChartSkeleton />}>
        <Charts />
      </LoadingState>
    </>
  );
}
```

## Error Handling

### useErrorHandler
```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, withErrorHandling } = useErrorHandler();

  const saveData = withErrorHandling(
    async (data) => {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    'saveData',
    { showToast: true, redirectOnAuth: true }
  );

  return <button onClick={() => saveData(formData)}>Simpan</button>;
}
```

### Error Boundary
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap components that might throw errors
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <MyComponent />
</ErrorBoundary>
```

## Best Practices

1. **Use skeleton screens for initial loads** - Better UX than spinners
2. **Use spinners for quick operations** - Button clicks, form submissions
3. **Match skeleton to actual content** - Same layout and dimensions
4. **Provide meaningful loading text** - "Memuat data mahasiswa..." vs "Memuat..."
5. **Handle errors gracefully** - Always show user-friendly messages in Indonesian
6. **Log errors in development** - Use error handler utilities
7. **Wrap async operations** - Use withLoading or withErrorHandling hooks
