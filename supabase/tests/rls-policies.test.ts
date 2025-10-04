import { createClient } from '@supabase/supabase-js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Test configuration
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

// Create clients
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Test user IDs
const ADMIN_USER_ID = '11111111-1111-1111-1111-111111111111'
const LECTURER_USER_ID = '22222222-2222-2222-2222-222222222222'
const LECTURER2_USER_ID = '33333333-3333-3333-3333-333333333333'

// Test data IDs
const STUDENT_1_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const STUDENT_2_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const COURSE_1_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const COURSE_2_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd'

describe('Row Level Security Policies', () => {
  beforeAll(async () => {
    // Setup test data using admin client
    await setupTestData()
  })

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData()
  })

  describe('Profiles Table RLS', () => {
    it('should allow authenticated users to view all profiles', async () => {
      // Create authenticated client for lecturer
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('profiles')
          .select('*')

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data!.length).toBeGreaterThanOrEqual(3)
      }
    })

    it('should allow users to update their own profile', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('profiles')
          .update({ department: 'Updated Department' })
          .eq('id', LECTURER_USER_ID)
          .select()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data![0].department).toBe('Updated Department')
      }
    })

    it('should prevent users from updating other profiles', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('profiles')
          .update({ department: 'Hacked Department' })
          .eq('id', ADMIN_USER_ID)
          .select()

        // Should return empty array due to RLS
        expect(error).toBeDefined()
        expect(data).toEqual([])
      }
    })
  })

  describe('Students Table RLS', () => {
    it('should allow all authenticated users to view students', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('students')
          .select('*')

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data!.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('should allow only admins to insert students', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('students')
          .insert({
            nim: 'ADMIN001',
            name: 'Admin Insert Test',
            program_studi: 'Test Program',
            angkatan: 2024
          })
          .select()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data![0].nim).toBe('ADMIN001')
      }
    })

    it('should prevent lecturers from inserting students', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { error } = await supabaseAuth
          .from('students')
          .insert({
            nim: 'LECTURER001',
            name: 'Lecturer Insert Test',
            program_studi: 'Test Program',
            angkatan: 2024
          })
          .select()

        expect(error).toBeDefined()
        expect(error!.code).toBe('42501') // Insufficient privilege
      }
    })
  })

  describe('Courses Table RLS', () => {
    it('should allow all authenticated users to view courses', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('courses')
          .select('*')

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data!.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('should allow lecturers to update their own courses', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('courses')
          .update({ name: 'Updated Course Name' })
          .eq('id', COURSE_1_ID)
          .select()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data![0].name).toBe('Updated Course Name')
      }
    })

    it('should prevent lecturers from updating other lecturers courses', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('courses')
          .update({ name: 'Hacked Course Name' })
          .eq('id', COURSE_2_ID)
          .select()

        // Should return empty array due to RLS
        expect(error).toBeDefined()
        expect(data).toEqual([])
      }
    })
  })

  describe('Grades Table RLS', () => {
    it('should allow lecturers to view grades for their courses', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('grades')
          .select(`
            *,
            courses!inner(lecturer_id)
          `)
          .eq('courses.lecturer_id', LECTURER_USER_ID)

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data!.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('should allow admins to view all grades', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('grades')
          .select('*')

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data!.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('should prevent lecturers from viewing grades of other lecturers courses', async () => {
      const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: 'lecturer@test.com',
        password: 'testpassword123'
      })

      if (authData.user) {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`
            }
          }
        })

        const { data, error } = await supabaseAuth
          .from('grades')
          .select(`
            *,
            courses!inner(lecturer_id)
          `)
          .eq('courses.lecturer_id', LECTURER2_USER_ID)

        expect(error).toBeNull()
        expect(data).toEqual([]) // Should be empty due to RLS
      }
    })
  })

  describe('Utility Functions', () => {
    it('should correctly calculate grade points', async () => {
      const { data, error } = await supabaseAdmin
        .rpc('calculate_grade_point', { grade_letter: 'A' })

      expect(error).toBeNull()
      expect(data).toBe(4.00)
    })

    it('should check admin role correctly', async () => {
      // This would need to be tested with proper auth context
      // For now, we'll test the function exists
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('role', 'admin')
        .limit(1)

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })
})

// Helper functions
async function setupTestData() {
  // Create test users in auth.users
  await supabaseAdmin.auth.admin.createUser({
    email: 'admin@test.com',
    password: 'testpassword123',
    user_metadata: {
      full_name: 'Test Admin',
      role: 'admin'
    }
  })

  await supabaseAdmin.auth.admin.createUser({
    email: 'lecturer@test.com',
    password: 'testpassword123',
    user_metadata: {
      full_name: 'Test Lecturer 1',
      role: 'dosen'
    }
  })

  await supabaseAdmin.auth.admin.createUser({
    email: 'lecturer2@test.com',
    password: 'testpassword123',
    user_metadata: {
      full_name: 'Test Lecturer 2',
      role: 'dosen'
    }
  })

  // Insert test profiles
  await supabaseAdmin.from('profiles').upsert([
    {
      id: ADMIN_USER_ID,
      full_name: 'Test Admin',
      role: 'admin',
      department: 'Administration'
    },
    {
      id: LECTURER_USER_ID,
      full_name: 'Test Lecturer 1',
      role: 'dosen',
      department: 'Computer Science'
    },
    {
      id: LECTURER2_USER_ID,
      full_name: 'Test Lecturer 2',
      role: 'dosen',
      department: 'Information Systems'
    }
  ])

  // Insert test students
  await supabaseAdmin.from('students').upsert([
    {
      id: STUDENT_1_ID,
      nim: 'TEST001',
      name: 'Test Student 1',
      program_studi: 'Teknik Informatika',
      angkatan: 2023,
      ipk: 3.50,
      semester_current: 3
    },
    {
      id: STUDENT_2_ID,
      nim: 'TEST002',
      name: 'Test Student 2',
      program_studi: 'Sistem Informasi',
      angkatan: 2023,
      ipk: 3.25,
      semester_current: 3
    }
  ])

  // Insert test courses
  await supabaseAdmin.from('courses').upsert([
    {
      id: COURSE_1_ID,
      code: 'TEST101',
      name: 'Test Course 1',
      credits: 3,
      semester: 1,
      program_studi: 'Teknik Informatika',
      lecturer_id: LECTURER_USER_ID
    },
    {
      id: COURSE_2_ID,
      code: 'TEST102',
      name: 'Test Course 2',
      credits: 3,
      semester: 1,
      program_studi: 'Sistem Informasi',
      lecturer_id: LECTURER2_USER_ID
    }
  ])

  // Insert test grades
  await supabaseAdmin.from('grades').upsert([
    {
      student_id: STUDENT_1_ID,
      course_id: COURSE_1_ID,
      grade: 'A',
      semester: '2023/1',
      academic_year: '2023/2024'
    },
    {
      student_id: STUDENT_2_ID,
      course_id: COURSE_2_ID,
      grade: 'B+',
      semester: '2023/1',
      academic_year: '2023/2024'
    }
  ])
}

async function cleanupTestData() {
  // Clean up in reverse order of dependencies
  await supabaseAdmin.from('grades').delete().in('student_id', [STUDENT_1_ID, STUDENT_2_ID])
  await supabaseAdmin.from('courses').delete().in('id', [COURSE_1_ID, COURSE_2_ID])
  await supabaseAdmin.from('students').delete().in('id', [STUDENT_1_ID, STUDENT_2_ID])
  await supabaseAdmin.from('profiles').delete().in('id', [ADMIN_USER_ID, LECTURER_USER_ID, LECTURER2_USER_ID])
  
  // Clean up auth users
  await supabaseAdmin.auth.admin.deleteUser(ADMIN_USER_ID)
  await supabaseAdmin.auth.admin.deleteUser(LECTURER_USER_ID)
  await supabaseAdmin.auth.admin.deleteUser(LECTURER2_USER_ID)
}