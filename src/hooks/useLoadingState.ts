'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggleLoading = useCallback(() => {
    setIsLoading(prev => !prev);
  }, []);

  /**
   * Wrap an async function with loading state management
   */
  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        startLoading();
        const result = await fn();
        return result;
      } catch (error) {
        throw error;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useMultipleLoadingStates<T extends string>(keys: T[]) {
  const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  );

  const setLoading = useCallback((key: T, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const startLoading = useCallback((key: T) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: T) => {
    setLoading(key, false);
  }, [setLoading]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isAnyLoading,
  };
}
