-- RLS Policy Testing Script
-- This script tests various scenarios to ensure RLS policies work correctly

-- Test 1: Create test users with different roles
-- Note: These would typically be created through Supabase Auth, 
-- but for testing purposes we can simulate the scenarios

-- Test scenario setup (to be run by admin)
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    lecturer_id UUID := gen_random_uuid();
    student_test_id UUID := gen_random_uuid();
    course_test_id UUID := gen_random_uuid();
BEGIN
    -- Insert test profiles
    INSERT INTO profiles (id, full_name, role) VALUES
    (admin_id, 'Test Admin', 'admin'),
    (lecturer_id, 'Test Lecturer', 'dosen');
    
    -- Insert test student (should only work for admin)
    INSERT INTO students (id, nim, name, program_studi, angkatan) VALUES
    (student_test_id, '123456789', 'Test Student', 'Teknik Informatika', 2023);
    
    -- Insert test course
    INSERT INTO courses (id, code, name, credits, semester, program_studi, lecturer_id) VALUES
    (course_test_id, 'TI001', 'Test Course', 3, 1, 'Teknik Informatika', lecturer_id);
    
    -- Insert test grade
    INSERT INTO grades (student_id, course_id, grade, semester, academic_year) VALUES
    (student_test_id, course_test_id, 'A', 'Ganjil', '2023/2024');
    
    RAISE NOTICE 'Test data created successfully';
END $$;

-- Test queries to verify RLS policies
-- These should be run with different user contexts

-- Test 2: Verify dashboard stats view works
SELECT * FROM dashboard_stats;

-- Test 3: Verify program stats view works
SELECT * FROM program_stats;

-- Test 4: Verify semester distribution view works
SELECT * FROM semester_distribution;

-- Test 5: Verify IPK calculation function
SELECT calculate_student_ipk((SELECT id FROM students LIMIT 1));

-- Test 6: Verify utility functions
SELECT is_admin();
SELECT get_user_role();

-- Test 7: Check if audit logs are created
SELECT COUNT(*) FROM audit_logs;

-- Cleanup test data (optional)
-- DELETE FROM grades WHERE student_id IN (SELECT id FROM students WHERE nim = '123456789');
-- DELETE FROM students WHERE nim = '123456789';
-- DELETE FROM courses WHERE code = 'TI001';
-- DELETE FROM profiles WHERE full_name IN ('Test Admin', 'Test Lecturer');