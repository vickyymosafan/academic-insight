/**
 * Integration tests for Student API routes
 * Tests CRUD operations and validation
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

import supabase from '@/lib/supabaseClient';

describe('Student API Routes', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'admin@test.com'
  };

  const mockAdminProfile = {
    id: 'test-user-id',
    role: 'admin'
  };

  const mockStudents = [
    {
      id: '1',
      nim: '12345678',
      name: 'John Doe',
      program_studi: 'Teknik Informatika',
      angkatan: 2023,
      ipk: 3.5,
      semester_current: 5,
      status: 'aktif',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/students', () => {
    it('should return 401 if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new NextRequest('http://localhost:3000/api/students');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return all students for authenticated user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockStudents,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        order: mockOrder
      });

      const request = new NextRequest('http://localhost:3000/api/students');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockStudents);
    });

    it('should filter students by program_studi', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockStudents,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      const request = new NextRequest('http://localhost:3000/api/students?program=Teknik%20Informatika');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockEq).toHaveBeenCalledWith('program_studi', 'Teknik Informatika');
    });

    it('should handle database errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder
      });

      mockSelect.mockReturnValue({
        order: mockOrder
      });

      const request = new NextRequest('http://localhost:3000/api/students');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Gagal mengambil data mahasiswa');
    });
  });

  describe('POST /api/students', () => {
    const validStudentData = {
      nim: '12345678',
      name: 'Jane Doe',
      program_studi: 'Sistem Informasi',
      angkatan: 2023,
      ipk: 3.8,
      semester_current: 3
    };

    it('should return 401 if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new NextRequest('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(validStudentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not admin', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockAdminProfile, role: 'dosen' },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        single: mockSingle
      });

      const request = new NextRequest('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(validStudentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Only admins');
    });

    it('should create student with valid data', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock profile check
      const mockProfileSelect = jest.fn().mockReturnThis();
      const mockProfileEq = jest.fn().mockReturnThis();
      const mockProfileSingle = jest.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null
      });

      // Mock insert
      const mockInsert = jest.fn().mockReturnThis();
      const mockInsertSelect = jest.fn().mockReturnThis();
      const mockInsertSingle = jest.fn().mockResolvedValue({
        data: { ...validStudentData, id: 'new-id' },
        error: null
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockProfileSelect
        })
        .mockReturnValueOnce({
          insert: mockInsert
        });

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq
      });

      mockProfileEq.mockReturnValue({
        single: mockProfileSingle
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle
      });

      const request = new NextRequest('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(validStudentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Data mahasiswa berhasil disimpan');
      expect(data.data).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        single: mockSingle
      });

      const invalidData = {
        nim: '123', // Invalid NIM
        name: 'A', // Too short
        program_studi: '',
        angkatan: 1999 // Invalid year
      };

      const request = new NextRequest('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('should return 409 for duplicate NIM', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock profile check
      const mockProfileSelect = jest.fn().mockReturnThis();
      const mockProfileEq = jest.fn().mockReturnThis();
      const mockProfileSingle = jest.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null
      });

      // Mock insert with unique constraint error
      const mockInsert = jest.fn().mockReturnThis();
      const mockInsertSelect = jest.fn().mockReturnThis();
      const mockInsertSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key' }
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockProfileSelect
        })
        .mockReturnValueOnce({
          insert: mockInsert
        });

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq
      });

      mockProfileEq.mockReturnValue({
        single: mockProfileSingle
      });

      mockInsert.mockReturnValue({
        select: mockInsertSelect
      });

      mockInsertSelect.mockReturnValue({
        single: mockInsertSingle
      });

      const request = new NextRequest('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(validStudentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('NIM sudah terdaftar');
    });
  });
});
