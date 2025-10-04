'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRealtimeSubscription } from './useRealtimeSubscription';

interface Student {
  status: 'aktif' | 'lulus' | 'dropout' | 'cuti';
  ipk: number | null;
}

interface DashboardStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  dropout_students: number;
  average_gpa: number;
  graduation_rate: number;
  dropout_rate: number;
}

/**
 * Custom hook untuk mengelola dashboard statistics dengan realtime updates
 */
export function useRealtimeDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate statistics from students data
  const calculateStats = useCallback((students: Student[]): DashboardStats => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'aktif').length;
    const graduatedStudents = students.filter(s => s.status === 'lulus').length;
    const dropoutStudents = students.filter(s => s.status === 'dropout').length;
    
    // Calculate average GPA (only for students with GPA > 0)
    const studentsWithGPA = students.filter(s => s.ipk && s.ipk > 0);
    const averageGPA = studentsWithGPA.length > 0 
      ? studentsWithGPA.reduce((sum, s) => sum + (s.ipk || 0), 0) / studentsWithGPA.length
      : 0;

    // Calculate rates
    const graduationRate = totalStudents > 0 ? (graduatedStudents / totalStudents) * 100 : 0;
    const dropoutRate = totalStudents > 0 ? (dropoutStudents / totalStudents) * 100 : 0;

    return {
      total_students: totalStudents,
      active_students: activeStudents,
      graduated_students: graduatedStudents,
      dropout_students: dropoutStudents,
      average_gpa: averageGPA,
      graduation_rate: graduationRate,
      dropout_rate: dropoutRate,
    };
  }, []);

  // Fetch and calculate statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('status, ipk') as { data: Student[] | null; error: Error | null };

      if (studentsError) {
        throw studentsError;
      }

      if (!students) {
        throw new Error('No data received from database');
      }

      const calculatedStats = calculateStats(students);
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle realtime updates - refetch stats when students data changes
  const handleStudentChange = useCallback(() => {
    console.log('📊 Student data changed, recalculating statistics...');
    fetchStats();
  }, [fetchStats]);

  // Setup realtime subscription for students table
  const { status: realtimeStatus, reconnect } = useRealtimeSubscription({
    table: 'students',
    event: '*',
    onChange: handleStudentChange,
    enabled: true,
  });

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    realtimeStatus,
    reconnect,
  };
}
