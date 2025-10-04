'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  grade: string;
  grade_point: number;
  semester: string;
  academic_year: string;
  created_at: string;
}

interface UseRealtimeGradesOptions {
  initialData?: Grade[];
  filter?: {
    student_id?: string;
    course_id?: string;
    semester?: string;
    academic_year?: string;
  };
  enabled?: boolean;
}

/**
 * Custom hook untuk mengelola data grades dengan realtime updates
 */
export function useRealtimeGrades(options: UseRealtimeGradesOptions = {}) {
  const { initialData = [], filter, enabled = true } = options;
  
  const [grades, setGrades] = useState<Grade[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('grades').select('*');

      // Apply filters
      if (filter?.student_id) {
        query = query.eq('student_id', filter.student_id);
      }
      if (filter?.course_id) {
        query = query.eq('course_id', filter.course_id);
      }
      if (filter?.semester) {
        query = query.eq('semester', filter.semester);
      }
      if (filter?.academic_year) {
        query = query.eq('academic_year', filter.academic_year);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setGrades(data || []);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial fetch
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Handle INSERT events
  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<Grade>) => {
    const newGrade = payload.new as Grade;
    
    // Check if new grade matches filter
    if (filter?.student_id && newGrade.student_id !== filter.student_id) {
      return;
    }
    if (filter?.course_id && newGrade.course_id !== filter.course_id) {
      return;
    }
    if (filter?.semester && newGrade.semester !== filter.semester) {
      return;
    }
    if (filter?.academic_year && newGrade.academic_year !== filter.academic_year) {
      return;
    }

    setGrades(prev => {
      // Check if grade already exists (prevent duplicates)
      const exists = prev.some(g => g.id === newGrade.id);
      if (exists) {
        return prev;
      }
      return [newGrade, ...prev];
    });

    console.log('✨ New grade added:', newGrade.grade);
  }, [filter]);

  // Handle UPDATE events
  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<Grade>) => {
    const updatedGrade = payload.new as Grade;
    
    setGrades(prev => {
      // Check if updated grade still matches filter
      const matchesFilter = 
        (!filter?.student_id || updatedGrade.student_id === filter.student_id) &&
        (!filter?.course_id || updatedGrade.course_id === filter.course_id) &&
        (!filter?.semester || updatedGrade.semester === filter.semester) &&
        (!filter?.academic_year || updatedGrade.academic_year === filter.academic_year);

      if (!matchesFilter) {
        // Remove from list if no longer matches filter
        return prev.filter(g => g.id !== updatedGrade.id);
      }

      // Update existing grade
      return prev.map(grade => 
        grade.id === updatedGrade.id ? updatedGrade : grade
      );
    });

    console.log('🔄 Grade updated:', updatedGrade.grade);
  }, [filter]);

  // Handle DELETE events
  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<Grade>) => {
    const deletedGrade = payload.old as Grade;
    
    setGrades(prev => prev.filter(g => g.id !== deletedGrade.id));
    
    console.log('🗑️ Grade deleted:', deletedGrade.id);
  }, []);

  // Setup realtime subscription
  const { status, reconnect } = useRealtimeSubscription<Record<string, unknown>>({
    table: 'grades',
    event: '*',
    onInsert: handleInsert as never,
    onUpdate: handleUpdate as never,
    onDelete: handleDelete as never,
    enabled,
  });

  return {
    grades,
    loading,
    error,
    refetch: fetchGrades,
    realtimeStatus: status,
    reconnect,
  };
}
