/**
 * Validation utilities for form inputs and data sanitization
 * Provides client-side and server-side validation with XSS protection
 */

export interface FormValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML tags and scripts
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize object by sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate NIM (Nomor Induk Mahasiswa)
 * Must be 8-12 digits
 */
export function isValidNIM(nim: string): boolean {
  const nimRegex = /^\d{8,12}$/;
  return nimRegex.test(nim);
}

/**
 * Validate IPK (Indeks Prestasi Kumulatif)
 * Must be between 0.00 and 4.00
 */
export function isValidIPK(ipk: number | string): boolean {
  const ipkNum = typeof ipk === 'string' ? parseFloat(ipk) : ipk;
  return !isNaN(ipkNum) && ipkNum >= 0 && ipkNum <= 4;
}

/**
 * Validate semester
 * Must be between 1 and 14
 */
export function isValidSemester(semester: number | string): boolean {
  const semesterNum = typeof semester === 'string' ? parseInt(semester) : semester;
  return !isNaN(semesterNum) && semesterNum >= 1 && semesterNum <= 14;
}

/**
 * Validate angkatan (year)
 * Must be between 2000 and current year
 */
export function isValidAngkatan(angkatan: number | string): boolean {
  const angkatanNum = typeof angkatan === 'string' ? parseInt(angkatan) : angkatan;
  const currentYear = new Date().getFullYear();
  return !isNaN(angkatanNum) && angkatanNum >= 2000 && angkatanNum <= currentYear;
}

/**
 * Validate student data for create/update operations
 */
export function validateStudentData(data: any, isUpdate = false): ValidationResult {
  const errors: FormValidationError[] = [];
  
  // Sanitize all string inputs
  const sanitizedData = sanitizeObject(data);
  
  // NIM validation (required for create, optional for update)
  if (!isUpdate) {
    if (!sanitizedData.nim || sanitizedData.nim.trim().length === 0) {
      errors.push({ field: 'nim', message: 'NIM wajib diisi' });
    } else if (!isValidNIM(sanitizedData.nim)) {
      errors.push({ field: 'nim', message: 'NIM harus berupa angka 8-12 digit' });
    }
  } else if (sanitizedData.nim && !isValidNIM(sanitizedData.nim)) {
    errors.push({ field: 'nim', message: 'NIM harus berupa angka 8-12 digit' });
  }
  
  // Name validation
  if (!isUpdate && (!sanitizedData.name || sanitizedData.name.trim().length === 0)) {
    errors.push({ field: 'name', message: 'Nama wajib diisi' });
  } else if (sanitizedData.name) {
    if (sanitizedData.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Nama minimal 2 karakter' });
    }
    if (sanitizedData.name.length > 100) {
      errors.push({ field: 'name', message: 'Nama maksimal 100 karakter' });
    }
  }
  
  // Program studi validation
  if (!isUpdate && (!sanitizedData.program_studi || sanitizedData.program_studi.trim().length === 0)) {
    errors.push({ field: 'program_studi', message: 'Program studi wajib diisi' });
  } else if (sanitizedData.program_studi && sanitizedData.program_studi.length > 100) {
    errors.push({ field: 'program_studi', message: 'Program studi maksimal 100 karakter' });
  }
  
  // IPK validation
  if (sanitizedData.ipk !== undefined && sanitizedData.ipk !== null && sanitizedData.ipk !== '') {
    if (!isValidIPK(sanitizedData.ipk)) {
      errors.push({ field: 'ipk', message: 'IPK harus antara 0.00 - 4.00' });
    }
  }
  
  // Semester validation
  if (sanitizedData.semester_current !== undefined && sanitizedData.semester_current !== null && sanitizedData.semester_current !== '') {
    if (!isValidSemester(sanitizedData.semester_current)) {
      errors.push({ field: 'semester_current', message: 'Semester harus antara 1 - 14' });
    }
  }
  
  // Angkatan validation
  if (!isUpdate && !sanitizedData.angkatan) {
    errors.push({ field: 'angkatan', message: 'Angkatan wajib diisi' });
  } else if (sanitizedData.angkatan && !isValidAngkatan(sanitizedData.angkatan)) {
    errors.push({ field: 'angkatan', message: 'Angkatan tidak valid' });
  }
  
  // Status validation
  if (sanitizedData.status) {
    const validStatuses = ['aktif', 'lulus', 'dropout', 'cuti'];
    if (!validStatuses.includes(sanitizedData.status)) {
      errors.push({ field: 'status', message: 'Status tidak valid' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate login credentials
 */
export function validateLoginData(data: any): ValidationResult {
  const errors: FormValidationError[] = [];
  const sanitizedData = sanitizeObject(data);
  
  // Email validation
  if (!sanitizedData.email || sanitizedData.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email wajib diisi' });
  } else if (!isValidEmail(sanitizedData.email)) {
    errors.push({ field: 'email', message: 'Format email tidak valid' });
  }
  
  // Password validation
  if (!sanitizedData.password || sanitizedData.password.length === 0) {
    errors.push({ field: 'password', message: 'Password wajib diisi' });
  } else if (sanitizedData.password.length < 6) {
    errors.push({ field: 'password', message: 'Password minimal 6 karakter' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove special characters that could be used for SQL injection
  let sanitized = query.replace(/[;'"\\]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 100);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}
