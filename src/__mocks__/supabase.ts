export const createMockSupabaseClient = () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
})

export const mockSupabaseClient = createMockSupabaseClient()

// Mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@university.edu',
  role: 'admin',
}

export const mockProfile = {
  id: 'test-user-id',
  user_id: 'test-user-id',
  full_name: 'Test User',
  avatar_url: null,
  department: 'Computer Science',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockStudent = {
  id: 'student-1',
  nim: '123456789',
  name: 'John Doe',
  program_studi: 'Teknik Informatika',
  angkatan: 2023,
  status: 'aktif',
  ipk: 3.75,
  semester_current: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockDashboardStats = {
  total_students: 1234,
  active_students: 1000,
  graduated_students: 200,
  dropout_students: 34,
  average_gpa: 3.45,
  graduation_rate: 85,
  dropout_rate: 2.8,
}
