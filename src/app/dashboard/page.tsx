'use client';

import { useAuth } from '@/lib/auth-context';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Academic Insight
        </h1>
        <p className="text-gray-600">
          Selamat datang, {user?.profile.full_name}
        </p>
      </div>

      {/* Dashboard Overview with Statistics */}
      <DashboardOverview />

      {/* Implementation Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Status Implementasi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Success Message */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Dashboard Utama dan Statistik Berhasil!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    🎉 Implementasi dashboard utama dan statistik telah selesai dengan fitur:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Dashboard layout dengan sidebar responsif</li>
                    <li>StatCard component untuk menampilkan statistik</li>
                    <li>Data visualization dengan charts (Recharts)</li>
                    <li>Fetch data statistik dari Supabase</li>
                    <li>Responsive grid layout untuk cards dan charts</li>
                    <li>Loading states dan error handling</li>
                    <li>Perhitungan otomatis IPK rata-rata dan tingkat kelulusan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Langkah Selanjutnya
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Task berikutnya yang akan diimplementasi:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Data tables dan filtering</li>
                    <li>Real-time updates</li>
                    <li>Progressive Web App (PWA)</li>
                    <li>Error handling dan loading states</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}