/**
 * Comprehensive Error Handling Utilities
 * Provides centralized error handling for API, authentication, and database errors
 */

import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import type { APIError } from '@/types/api';

// Error types
export type ErrorType = 'auth' | 'api' | 'database' | 'network' | 'validation' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Handle authentication errors from Supabase
 */
export function handleAuthError(error: SupabaseAuthError | any): string {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui';

  const errorCode = error.code || error.message;

  switch (errorCode) {
    case 'invalid_credentials':
    case 'Invalid login credentials':
      return 'Email atau password tidak valid';
    
    case 'email_not_confirmed':
      return 'Silakan konfirmasi email Anda terlebih dahulu';
    
    case 'user_not_found':
      return 'Pengguna tidak ditemukan';
    
    case 'too_many_requests':
      return 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit';
    
    case 'weak_password':
      return 'Password terlalu lemah. Gunakan minimal 8 karakter';
    
    case 'email_exists':
    case 'User already registered':
      return 'Email sudah terdaftar';
    
    case 'invalid_email':
      return 'Format email tidak valid';
    
    case 'session_expired':
      return 'Sesi Anda telah berakhir. Silakan login kembali';
    
    case 'unauthorized':
      return 'Anda tidak memiliki akses untuk melakukan aksi ini';
    
    default:
      return error.message || 'Terjadi kesalahan saat autentikasi. Silakan coba lagi';
  }
}

/**
 * Handle API errors with appropriate user messages
 */
export function handleAPIError(error: APIError | any): string {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui';

  const status = error.status || error.statusCode;

  switch (status) {
    case 400:
      return error.message || 'Permintaan tidak valid. Periksa data yang Anda kirim';
    
    case 401:
      return 'Sesi Anda telah berakhir. Silakan login kembali';
    
    case 403:
      return 'Anda tidak memiliki akses untuk melakukan aksi ini';
    
    case 404:
      return error.message || 'Data yang Anda cari tidak ditemukan';
    
    case 409:
      return error.message || 'Data sudah ada. Gunakan data yang berbeda';
    
    case 422:
      return error.message || 'Data yang Anda kirim tidak valid';
    
    case 429:
      return 'Terlalu banyak permintaan. Coba lagi dalam beberapa saat';
    
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Terjadi kesalahan server. Silakan coba lagi nanti';
    
    default:
      return error.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi';
  }
}

/**
 * Handle database errors from Supabase
 */
export function handleDatabaseError(error: any): string {
  if (!error) return 'Terjadi kesalahan database';

  const errorCode = error.code || error.message;

  // PostgreSQL error codes
  switch (errorCode) {
    case '23505': // unique_violation
      return 'Data sudah ada. Gunakan nilai yang berbeda';
    
    case '23503': // foreign_key_violation
      return 'Data terkait tidak ditemukan';
    
    case '23502': // not_null_violation
      return 'Data wajib tidak boleh kosong';
    
    case '22P02': // invalid_text_representation
      return 'Format data tidak valid';
    
    case '42P01': // undefined_table
      return 'Tabel database tidak ditemukan';
    
    case 'PGRST116': // Row level security violation
      return 'Anda tidak memiliki akses untuk data ini';
    
    default:
      return error.message || 'Terjadi kesalahan saat mengakses database';
  }
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): string {
  if (!error) return 'Terjadi kesalahan jaringan';

  if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda';
  }

  if (error.message === 'Network request failed') {
    return 'Permintaan jaringan gagal. Periksa koneksi internet Anda';
  }

  return 'Terjadi kesalahan jaringan. Silakan coba lagi';
}

/**
 * Generic error handler that determines error type and returns appropriate message
 */
export function handleError(error: any): AppError {
  const timestamp = new Date();

  // Network errors
  if (error.name === 'NetworkError' || error.message === 'Failed to fetch') {
    return {
      type: 'network',
      message: handleNetworkError(error),
      code: error.code,
      details: error,
      timestamp,
    };
  }

  // Supabase auth errors
  if (error.__isAuthError || error.status === 401) {
    return {
      type: 'auth',
      message: handleAuthError(error),
      code: error.code,
      details: error,
      timestamp,
    };
  }

  // Database errors (PostgreSQL codes)
  if (error.code && (error.code.startsWith('23') || error.code.startsWith('42') || error.code === 'PGRST116')) {
    return {
      type: 'database',
      message: handleDatabaseError(error),
      code: error.code,
      details: error,
      timestamp,
    };
  }

  // API errors with status codes
  if (error.status || error.statusCode) {
    return {
      type: 'api',
      message: handleAPIError(error),
      code: error.code,
      details: error,
      timestamp,
    };
  }

  // Validation errors
  if (error.errors && Array.isArray(error.errors)) {
    return {
      type: 'validation',
      message: 'Data yang Anda masukkan tidak valid',
      details: error.errors,
      timestamp,
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: error.message || 'Terjadi kesalahan tidak terduga',
    code: error.code,
    details: error,
    timestamp,
  };
}

/**
 * Log errors for debugging (can be extended to send to logging service)
 */
export function logError(error: AppError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error ${context ? `in ${context}` : ''}`);
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Timestamp:', error.timestamp.toISOString());
    console.error('Details:', error.details);
    console.groupEnd();
  }

  // In production, you could send errors to a logging service like Sentry
  // Example: Sentry.captureException(error.details, { extra: { type: error.type, context } });
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(error: any, status?: number) {
  const appError = handleError(error);
  
  return {
    error: appError.message,
    code: appError.code,
    type: appError.type,
    timestamp: appError.timestamp.toISOString(),
  };
}
