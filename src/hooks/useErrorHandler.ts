'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';
import { handleError, logError, type AppError } from '@/lib/error-handler';

/**
 * Custom hook for handling errors consistently across the application
 */
export function useErrorHandler() {
  const toast = useToast();
  const router = useRouter();

  /**
   * Handle error with toast notification and optional redirect
   */
  const handleErrorWithToast = useCallback(
    (error: any, context?: string, redirectOnAuth = true): AppError => {
      const appError = handleError(error);
      
      // Log error for debugging
      logError(appError, context);

      // Show toast notification
      toast.error(appError.message);

      // Redirect to login if authentication error
      if (appError.type === 'auth' && redirectOnAuth) {
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      }

      return appError;
    },
    [toast, router]
  );

  /**
   * Handle error silently (only log, no toast)
   */
  const handleErrorSilently = useCallback(
    (error: any, context?: string): AppError => {
      const appError = handleError(error);
      logError(appError, context);
      return appError;
    },
    []
  );

  /**
   * Handle API response errors
   */
  const handleAPIResponse = useCallback(
    async (response: Response, context?: string): Promise<any> => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const error = {
          status: response.status,
          message: errorData.error || errorData.message || response.statusText,
          code: errorData.code,
          details: errorData,
        };

        return handleErrorWithToast(error, context);
      }

      return response.json();
    },
    [handleErrorWithToast]
  );

  /**
   * Wrap async function with error handling
   */
  const withErrorHandling = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      context?: string,
      options?: {
        showToast?: boolean;
        redirectOnAuth?: boolean;
        onError?: (error: AppError) => void;
      }
    ) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
        try {
          return await fn(...args);
        } catch (error) {
          const appError = options?.showToast !== false
            ? handleErrorWithToast(error, context, options?.redirectOnAuth)
            : handleErrorSilently(error, context);

          if (options?.onError) {
            options.onError(appError);
          }

          return null;
        }
      };
    },
    [handleErrorWithToast, handleErrorSilently]
  );

  return {
    handleError: handleErrorWithToast,
    handleErrorSilently,
    handleAPIResponse,
    withErrorHandling,
  };
}
