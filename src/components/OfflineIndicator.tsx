'use client';

import { useEffect, useState } from 'react';
import { WifiIcon, SignalSlashIcon } from '@heroicons/react/24/outline';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 animate-slide-down"
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          isOnline
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}
      >
        {isOnline ? (
          <>
            <WifiIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Kembali Online
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Koneksi internet tersambung
              </p>
            </div>
          </>
        ) : (
          <>
            <SignalSlashIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Mode Offline
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Menampilkan data yang tersimpan
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
