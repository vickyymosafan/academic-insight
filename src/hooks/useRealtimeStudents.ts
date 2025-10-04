'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Student {
  id: string;
  nim: string;
  name: string;
  program_studi: string;
  angkatan: number;
  status: 'aktif' | 'lulus' | 'dropout' | 'cuti';
  ipk: number | null;
  semester_current: number;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeStudentsOptions {
  initialData?: Student[];
  filter?: {
    program_studi?: string;
    angkatan?: number;
    status?: string;
  };
  enabled?: boolean;
}

/**
 * Custom hook untuk mengelola data students dengan realtime updates
 */
export function useRealtimeStudents(options: UseRealtimeStudentsOptions = {}) {
  const { initialData = [], filter, enabled = true } = options;
  
  const [students, setStudents] = useState<Student[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('students').select('*');

      // Apply filters
      if (filter?.program_studi) {
        query = query.eq('program_studi', filter.program_studi);
      }
      if (filter?.angkatan) {
        query = query.eq('angkatan', filter.angkatan);
      }
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle INSERT events
  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<Student>) => {
    const newStudent = payload.new as Student;
    
    // Check if new student matches filter
    if (filter?.program_studi && newStudent.program_studi !== filter.program_studi) {
      return;
    }
    if (filter?.angkatan && newStudent.angkatan !== filter.angkatan) {
      return;
    }
    if (filter?.status && newStudent.status !== filter.status) {
      return;
    }

    setStudents(prev => {
      // Check if student already exists (prevent duplicates)
      const exists = prev.some(s => s.id === newStudent.id);
      if (exists) {
        return prev;
      }
      return [newStudent, ...prev];
    });

    console.log('✨ New student added:', newStudent.name);
    
    // Dispatch custom event for toast notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-added', { 
        detail: { name: newStudent.name } 
      }));
    }
  }, [filter]);

  // Handle UPDATE events
  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<Student>) => {
    const updatedStudent = payload.new as Student;
    
    setStudents(prev => {
      // Check if updated student still matches filter
      const matchesFilter = 
        (!filter?.program_studi || updatedStudent.program_studi === filter.program_studi) &&
        (!filter?.angkatan || updatedStudent.angkatan === filter.angkatan) &&
        (!filter?.status || updatedStudent.status === filter.status);

      if (!matchesFilter) {
        // Remove from list if no longer matches filter
        return prev.filter(s => s.id !== updatedStudent.id);
      }

      // Update existing student
      return prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      );
    });

    console.log('🔄 Student updated:', updatedStudent.name);
    
    // Dispatch custom event for toast notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-updated', { 
        detail: { name: updatedStudent.name } 
      }));
    }
  }, [filter]);

  // Handle DELETE events
  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<Student>) => {
    const deletedStudent = payload.old as Student;
    
    setStudents(prev => prev.filter(s => s.id !== deletedStudent.id));
    
    console.log('🗑️ Student deleted:', deletedStudent.id);
    
    // Dispatch custom event for toast notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-deleted', { 
        detail: { id: deletedStudent.id } 
      }));
    }
  }, []);

  // Setup realtime subscription
  const { status, reconnect } = useRealtimeSubscription<Record<string, unknown>>({
    table: 'students',
    event: '*',
    onInsert: handleInsert as never,
    onUpdate: handleUpdate as never,
    onDelete: handleDelete as never,
    enabled,
  });

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    realtimeStatus: status,
    reconnect,
  };
}
