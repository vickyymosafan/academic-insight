// API Response Types

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface APIError {
  status: number;
  message: string;
  code?: string;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

// CRUD Request Types
export interface CreateStudentRequest {
  nim: string;
  name: string;
  program_studi: string;
  angkatan: number;
  ipk?: number;
  semester_current?: number;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

// Supabase Configuration Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth: {
      autoRefreshToken: boolean;
      persistSession: boolean;
    };
  };
}

import type { Student } from './database';