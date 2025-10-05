# Integration Example: Error Handling & Loading States

## Example: Updating Dashboard Component

### Before (Without Error Handling & Loading States)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from('students')
        .select('*');
      
      if (error) {
        console.error(error);
        return;
      }
      
      setStats(data);
    }
    
    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### After (With Error Handling & Loading States)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import LoadingState from '@/components/ui/LoadingState';
import { DashboardSkeleton } from '@/components/skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const { isLoading, withLoading } = useLoadingState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    async function fetchStats() {
      await withLoading(async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select('*');
          
          if (error) throw error;
          
          setStats(data);
        } catch (error) {
          handleError(error, 'fetchDashboardStats');
        }
      });
    }
    
    fetchStats();
  }, []);

  return (
    <ErrorBoundary>
      <LoadingState 
        isLoading={isLoading} 
        skeleton={<DashboardSkeleton />}
      >
        <div>
          <h1>Dashboard</h1>
          {/* Dashboard content */}
        </div>
      </LoadingState>
    </ErrorBoundary>
  );
}
```

## Example: Form with Error Handling

### Before

```tsx
'use client';

import { useState } from 'react';

export default function StudentForm() {
  const [formData, setFormData] = useState({ name: '', nim: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        alert('Error saving data');
        return;
      }
      
      alert('Success!');
    } catch (error) {
      alert('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### After

```tsx
'use client';

import { useState } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/lib/toast-context';
import { ButtonLoading } from '@/components/ui/LoadingState';

export default function StudentForm() {
  const [formData, setFormData] = useState({ name: '', nim: '' });
  const { isLoading, withLoading } = useLoadingState();
  const { handleAPIResponse } = useErrorHandler();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(async () => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await handleAPIResponse(response, 'saveStudent');
      
      if (result) {
        toast.success('Data mahasiswa berhasil disimpan');
        // Reset form or redirect
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isLoading}
      />
      <button disabled={isLoading}>
        <ButtonLoading isLoading={isLoading} loadingText="Menyimpan...">
          Simpan Data
        </ButtonLoading>
      </button>
    </form>
  );
}
```

## Example: API Route with Error Handling

### Before

```tsx
// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('students')
    .select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

### After

```tsx
// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createErrorResponse } from '@/lib/error-handler';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
```

## Example: Multiple Loading States

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useMultipleLoadingStates } from '@/hooks/useLoadingState';
import LoadingState from '@/components/ui/LoadingState';
import { StatCardsGridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/skeletons';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState(null);
  
  const { loadingStates, startLoading, stopLoading } = useMultipleLoadingStates([
    'stats',
    'charts',
    'table'
  ]);

  useEffect(() => {
    async function fetchStats() {
      startLoading('stats');
      try {
        const data = await fetch('/api/stats').then(r => r.json());
        setStats(data);
      } finally {
        stopLoading('stats');
      }
    }

    async function fetchCharts() {
      startLoading('charts');
      try {
        const data = await fetch('/api/charts').then(r => r.json());
        setChartData(data);
      } finally {
        stopLoading('charts');
      }
    }

    async function fetchTable() {
      startLoading('table');
      try {
        const data = await fetch('/api/students').then(r => r.json());
        setTableData(data);
      } finally {
        stopLoading('table');
      }
    }

    fetchStats();
    fetchCharts();
    fetchTable();
  }, []);

  return (
    <div className="space-y-6">
      <LoadingState 
        isLoading={loadingStates.stats} 
        skeleton={<StatCardsGridSkeleton />}
      >
        <StatsCards data={stats} />
      </LoadingState>

      <LoadingState 
        isLoading={loadingStates.charts} 
        skeleton={<ChartSkeleton />}
      >
        <Charts data={chartData} />
      </LoadingState>

      <LoadingState 
        isLoading={loadingStates.table} 
        skeleton={<TableSkeleton />}
      >
        <DataTable data={tableData} />
      </LoadingState>
    </div>
  );
}
```

## Key Improvements

1. ✅ **User-friendly error messages** in Indonesian
2. ✅ **Consistent error handling** across the application
3. ✅ **Better loading UX** with skeleton screens
4. ✅ **Automatic error logging** for debugging
5. ✅ **Type-safe** error handling with TypeScript
6. ✅ **Reusable hooks** for common patterns
7. ✅ **Global error boundary** catches unexpected errors
