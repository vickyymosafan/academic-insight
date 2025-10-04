'use client';

import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import ChartContainer from './ChartContainer';
import { supabase } from '@/lib/supabaseClient';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('status, ipk') as { data: Student[] | null; error: Error | null };

      if (studentsError) {
        throw studentsError;
      }

      if (!students) {
        throw new Error('No data received from database');
      }

      // Calculate statistics
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

      setStats({
        total_students: totalStudents,
        active_students: activeStudents,
        graduated_students: graduatedStudents,
        dropout_students: dropoutStudents,
        average_gpa: averageGPA,
        graduation_rate: graduationRate,
        dropout_rate: dropoutRate,
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error memuat data statistik
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={fetchDashboardStats}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Mahasiswa"
          value={loading ? 0 : stats?.total_students || 0}
          icon={UsersIcon}
          description="Jumlah keseluruhan mahasiswa"
          loading={loading}
        />
        
        <StatCard
          title="Mahasiswa Aktif"
          value={loading ? 0 : stats?.active_students || 0}
          icon={AcademicCapIcon}
          description="Mahasiswa yang masih aktif kuliah"
          loading={loading}
          change={stats && stats.total_students > 0 ? {
            value: Math.round((stats.active_students / stats.total_students) * 100),
            type: 'neutral'
          } : undefined}
        />
        
        <StatCard
          title="IPK Rata-rata"
          value={loading ? '0.00' : stats?.average_gpa.toFixed(2) || '0.00'}
          icon={ChartBarIcon}
          description="IPK rata-rata seluruh mahasiswa"
          loading={loading}
          change={stats && stats.average_gpa >= 3.0 ? {
            value: Math.round(((stats.average_gpa - 2.5) / 2.5) * 100),
            type: stats.average_gpa >= 3.0 ? 'increase' : 'decrease'
          } : undefined}
        />
        
        <StatCard
          title="Tingkat Kelulusan"
          value={loading ? '0%' : `${stats?.graduation_rate.toFixed(1)}%` || '0%'}
          icon={AcademicCapIcon}
          description="Persentase mahasiswa yang lulus"
          loading={loading}
          change={stats && stats.graduation_rate > 0 ? {
            value: Math.round(stats.graduation_rate),
            type: stats.graduation_rate >= 80 ? 'increase' : stats.graduation_rate >= 60 ? 'neutral' : 'decrease'
          } : undefined}
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard
          title="Mahasiswa Lulus"
          value={loading ? 0 : stats?.graduated_students || 0}
          icon={AcademicCapIcon}
          description="Jumlah mahasiswa yang telah lulus"
          loading={loading}
        />
        
        <StatCard
          title="Tingkat Dropout"
          value={loading ? '0%' : `${stats?.dropout_rate.toFixed(1)}%` || '0%'}
          icon={ExclamationTriangleIcon}
          description="Persentase mahasiswa yang dropout"
          loading={loading}
          change={stats && stats.dropout_rate > 0 ? {
            value: Math.round(stats.dropout_rate),
            type: stats.dropout_rate <= 5 ? 'increase' : stats.dropout_rate <= 15 ? 'neutral' : 'decrease'
          } : undefined}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          type="gpa-distribution"
          title="Distribusi IPK Mahasiswa"
          height={300}
        />
        
        <ChartContainer
          type="program-distribution"
          title="Distribusi Program Studi"
          height={300}
        />
        
        <ChartContainer
          type="graduation-trends"
          title="Tren Kelulusan per Tahun"
          height={300}
        />
        
        <ChartContainer
          type="dropout-analysis"
          title="Analisis Dropout per Semester"
          height={300}
        />
      </div>

      {/* Info Message if no data */}
      {!loading && stats && stats.total_students === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <UsersIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Belum ada data mahasiswa
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Silakan tambahkan data mahasiswa terlebih dahulu untuk melihat statistik dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}