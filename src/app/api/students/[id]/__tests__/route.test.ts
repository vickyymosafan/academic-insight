/**
 * Integration tests for Student [id] API routes
 * Tests GET, PUT, DELETE operations
 */

import { GET, PUT, DELETE } from '../route';
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

describe('Student [id] API Routes', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'admin@test.com'
  };

  const mockAdminProfile = {
    id: 'test-user-id',
    role: 'admin'
  };

  const mockStudent = {
    id: 'student-id-123',
    nim: '12345678',
    name: 'John Doe',
    program_studi: 'Teknik Informatika',
    angkatan: 2023,
    ipk: 3.5,
    semester_current: 5,
    status: 'aktif',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const validUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/students/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`);
      const response = await GET(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid UUID format', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const invalidId = 'invalid-id';
      const request = new NextRequest(`http://localhost:3000/api/students/${invalidId}`);
      const response = await GET(request, { params: { id: invalidId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid student ID format');
    });

    it('should return student data for valid ID', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockStudent,
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

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`);
      const response = await GET(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockStudent);
    });

    it('should return 404 if student not found', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
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

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`);
      const response = await GET(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Mahasiswa tidak ditemukan');
    });
  });

  describe('PUT /api/students/[id]', () => {
    const updateData = {
      name: 'Jane Doe Updated',
      ipk: 3.8
    };

    it('should return 401 if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: validUUID } });
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

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Only admins');
    });

    it('should update student with valid data', async () => {
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

      // Mock update
      const mockUpdate = jest.fn().mockReturnThis();
      const mockUpdateEq = jest.fn().mockReturnThis();
      const mockUpdateSelect = jest.fn().mockReturnThis();
      const mockUpdateSingle = jest.fn().mockResolvedValue({
        data: { ...mockStudent, ...updateData },
        error: null
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockProfileSelect
        })
        .mockReturnValueOnce({
          update: mockUpdate
        });

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq
      });

      mockProfileEq.mockReturnValue({
        single: mockProfileSingle
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq
      });

      mockUpdateEq.mockReturnValue({
        select: mockUpdateSelect
      });

      mockUpdateSelect.mockReturnValue({
        single: mockUpdateSingle
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Data mahasiswa berhasil diperbarui');
      expect(data.data.name).toBe(updateData.name);
    });

    it('should return 400 for invalid update data', async () => {
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
        ipk: 5.0 // Invalid IPK
      };

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });

      const response = await PUT(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 if student not found', async () => {
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

      // Mock update with not found error
      const mockUpdate = jest.fn().mockReturnThis();
      const mockUpdateEq = jest.fn().mockReturnThis();
      const mockUpdateSelect = jest.fn().mockReturnThis();
      const mockUpdateSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockProfileSelect
        })
        .mockReturnValueOnce({
          update: mockUpdate
        });

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq
      });

      mockProfileEq.mockReturnValue({
        single: mockProfileSingle
      });

      mockUpdate.mockReturnValue({
        eq: mockUpdateEq
      });

      mockUpdateEq.mockReturnValue({
        select: mockUpdateSelect
      });

      mockUpdateSelect.mockReturnValue({
        single: mockUpdateSingle
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Mahasiswa tidak ditemukan');
    });
  });

  describe('DELETE /api/students/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: validUUID } });
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

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Only admins');
    });

    it('should delete student successfully', async () => {
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

      // Mock delete
      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteEq = jest.fn().mockResolvedValue({
        error: null
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockProfileSelect
        })
        .mockReturnValueOnce({
          delete: mockDelete
        });

      mockProfileSelect.mockReturnValue({
        eq: mockProfileEq
      });

      mockProfileEq.mockReturnValue({
        single: mockProfileSingle
      });

      mockDelete.mockReturnValue({
        eq: mockDeleteEq
      });

      const request = new NextRequest(`http://localhost:3000/api/students/${validUUID}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: validUUID } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Data mahasiswa berhasil dihapus');
    });

    it('should return 400 for invalid UUID format', async () => {
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

      const invalidId = 'invalid-id';
      const request = new NextRequest(`http://localhost:3000/api/students/${invalidId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: invalidId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid student ID format');
    });
  });
});
