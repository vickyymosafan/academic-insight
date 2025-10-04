'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { cacheData, getCachedData } from '@/lib/offline-cache';

interface UseOfflineDataOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  enabled?: boolean;
}

interface UseOfflineDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isFromCache: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data with offline cache support
 * Automatically caches data when online and retrieves from cache when offline
 */
export function useOfflineData<T>({
  key,
  fetchFn,
  enabled = true,
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useOnlineStatus();

  const fetchData = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Fetch fresh data when online
        const freshData = await fetchFn();
        setData(freshData);
        setIsFromCache(false);
        
        // Cache the fresh data
        cacheData(key, freshData);
      } else {
        // Use cached data when offline
        const cachedData = getCachedData<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        } else {
          throw new Error('Tidak ada data cache tersedia untuk mode offline');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      // Try to use cached data as fallback
      const cachedData = getCachedData<T>(key);
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isOnline, enabled]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refetch: fetchData,
  };
}
