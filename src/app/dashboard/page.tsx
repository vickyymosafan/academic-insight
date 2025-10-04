'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Academic Insight
                </h1>
                <p className="text-gray-600">
                  Selamat datang, {user?.profile.full_name}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile.full_name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Keluar...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ringkasan Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Selamat datang di dashboard analisis kinerja program studi.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Success Message */}
              <div className="col-span-full p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Sistem Autentikasi Berhasil!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        🎉 Implementasi sistem autentikasi telah selesai dengan fitur:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Login dengan email dan password</li>
                        <li>Protected routes dengan middleware</li>
                        <li>Session management otomatis</li>
                        <li>Role-based access control</li>
                        <li>Automatic logout saat session berakhir</li>
                        <li>Responsive design untuk mobile dan desktop</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Informasi Pengguna</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Email:</span> {user?.email}</p>
                  <p><span className="font-medium">Role:</span> {user?.role}</p>
                  <p><span className="font-medium">Nama:</span> {user?.profile.full_name}</p>
                  {user?.profile.department && (
                    <p><span className="font-medium">Departemen:</span> {user.profile.department}</p>
                  )}
                </div>
              </div>

              {/* Next Steps Card */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Langkah Selanjutnya</h3>
                <div className="text-sm text-yellow-800">
                  <p>Task berikutnya yang akan diimplementasi:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Setup database schema</li>
                    <li>Implementasi dashboard statistik</li>
                    <li>Data visualization dengan charts</li>
                    <li>PWA configuration</li>
                  </ul>
                </div>
              </div>

              {/* Security Info Card */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Keamanan</h3>
                <div className="text-sm text-purple-800">
                  <p>Fitur keamanan yang aktif:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>JWT token authentication</li>
                    <li>HTTPS encryption</li>
                    <li>Row Level Security (RLS)</li>
                    <li>Input validation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}