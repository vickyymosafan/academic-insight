'use client';

import { useState } from 'react';
import StatCard from './StatCard';
import ChartContainer from './ChartContainer';
import { useRealtimeDashboardStats } from '@/hooks/useRealtimeDashboardStats';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function DashboardOverview() {
  const { stats, loading, error, refetch, realtimeStatus, reconnect } = useRealtimeDashboardStats();
  const [showRealtimeIndicator, setShowRealtimeIndicator] = useState(true);

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
                onClick={refetch}
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
      {/* Realtime Status Indicator */}
      {showRealtimeIndicator && (
        <div className={`rounded-md p-4 transition-all duration-300 ${
          realtimeStatus.isConnected 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {realtimeStatus.isConnected ? (
                  <SignalIcon className="h-5 w-5 text-green-400 animate-pulse" aria-hidden="true" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  realtimeStatus.isConnected ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {realtimeStatus.isConnected 
                    ? '🔴 Live - Data diperbarui secara real-time' 
                    : 'Koneksi real-time terputus'}
                </h3>
                {realtimeStatus.lastUpdate && (
                  <p className={`text-xs mt-1 ${
                    realtimeStatus.isConnected ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    Update terakhir: {new Date(realtimeStatus.lastUpdate).toLocaleTimeString('id-ID')}
                  </p>
                )}
                {realtimeStatus.error && (
                  <p className="text-xs mt-1 text-red-700">
                    Error: {realtimeStatus.error}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!realtimeStatus.isConnected && (
                <button
                  type="button"
                  onClick={reconnect}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Reconnect
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowRealtimeIndicator(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Tutup</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
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