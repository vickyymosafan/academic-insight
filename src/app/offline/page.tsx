'use client';

import { SignalSlashIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <SignalSlashIcon className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Tidak Ada Koneksi Internet
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia, tetapi Anda masih dapat
          melihat data yang telah dimuat sebelumnya.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Fitur yang Tersedia Offline:
          </h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
            <li>• Melihat dashboard yang telah dimuat</li>
            <li>• Membaca data mahasiswa yang di-cache</li>
            <li>• Melihat grafik dan statistik tersimpan</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Coba Lagi
        </button>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Halaman akan otomatis dimuat ulang saat koneksi kembali
        </p>
      </div>
    </div>
  );
}
