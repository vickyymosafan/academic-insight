-- RLS Policy Testing Script
-- This script tests Row Level Security policies for all tables
-- Run this script to verify that RLS policies are working correctly

-- =============================================
-- TEST SETUP
-- =============================================

-- Create test users (these would normally be created through Supabase Auth)
-- For testing purposes, we'll simulate different user contexts

-- Test data setup
DO $
DECLARE
    admin_user_id UUID := gen_random_uuid();
    lecturer_user_id UUID := gen_random_uuid();
    student_id_1 UUID := gen_random_uuid();
    student_id_2 UUID := gen_random_uuid();
    course_id_1 UUID := gen_random_uuid();
    course_id_2 UUID := gen_random_uuid();
BEGIN
    -- Insert test profiles
    INSERT INTO profiles (id, full_name, role, department) VALUES
    (admin_user_id, 'Admin User', 'admin', 'IT Department'),
    (lecturer_user_id, 'Lecturer User', 'dosen', 'Computer Science');

    -- Insert test students
    INSERT INTO students (id, nim, name, program_studi, angkatan, ipk, semester_current) VALUES
    (student_id_1, '2023001001', 'Student One', 'Teknik Informatika', 2023, 3.50, 3),
    (student_id_2, '2023001002', 'Student Two', 'Sistem Informasi', 2023, 3.25, 3);

    -- Insert test courses
    INSERT INTO courses (id, code, name, credits, semester, program_studi, lecturer_id) VALUES
    (course_id_1, 'TI101', 'Programming Basics', 3, 1, 'Teknik Informatika', lecturer_user_id),
    (course_id_2, 'SI101', 'Information Systems', 3, 1, 'Sistem Informasi', admin_user_id);

    -- Insert test grades
    INSERT INTO grades (student_id, course_id, grade, semester, academic_year) VALUES
    (student_id_1, course_id_1, 'A', '2023/1', '2023/2024'),
    (student_id_2, course_id_2, 'B+', '2023/1', '2023/2024');

    -- Store test IDs for reference
    RAISE NOTICE 'Test data created:';
    RAISE NOTICE 'Admin User ID: %', admin_user_id;
    RAISE NOTICE 'Lecturer User ID: %', lecturer_user_id;
    RAISE NOTICE 'Student 1 ID: %', student_id_1;
    RAISE NOTICE 'Student 2 ID: %', student_id_2;
    RAISE NOTICE 'Course 1 ID: %', course_id_1;
    RAISE NOTICE 'Course 2 ID: %', course_id_2;
END;
$;

-- =============================================
-- PROFILES TABLE TESTS
-- =============================================

-- Test 1: Authenticated users can view all profiles
SELECT 'TEST 1: Profiles SELECT policy' as test_name;
-- This should return all profiles for authenticated users
SELECT COUNT(*) as profile_count FROM profiles;

-- Test 2: Users can only update their own profile
-- This would need to be tested with actual auth context
SELECT 'TEST 2: Profile UPDATE policy - requires auth context testing' as test_name;

-- =============================================
-- STUDENTS TABLE TESTS
-- =============================================

-- Test 3: All authenticated users can view students
SELECT 'TEST 3: Students SELECT policy' as test_name;
SELECT COUNT(*) as student_count FROM students;

-- Test 4: Only admins can modify students (requires auth context)
SELECT 'TEST 4: Students CRUD policies - requires auth context testing' as test_name;

-- =============================================
-- COURSES TABLE TESTS
-- =============================================

-- Test 5: All authenticated users can view courses
SELECT 'TEST 5: Courses SELECT policy' as test_name;
SELECT COUNT(*) as course_count FROM courses;

-- Test 6: Lecturers can manage their own courses (requires auth context)
SELECT 'TEST 6: Courses management policies - requires auth context testing' as test_name;

-- =============================================
-- GRADES TABLE TESTS
-- =============================================

-- Test 7: Grades visibility based on lecturer/admin role (requires auth context)
SELECT 'TEST 7: Grades visibility policies - requires auth context testing' as test_name;
SELECT COUNT(*) as grade_count FROM grades;

-- =============================================
-- UTILITY FUNCTION TESTS
-- =============================================

-- Test 8: Test utility functions
SELECT 'TEST 8: Utility functions' as test_name;

-- Test grade point calculation
SELECT 
    grade,
    calculate_grade_point(grade) as calculated_point,
    grade_point as stored_point
FROM grades
ORDER BY grade;

-- =============================================
-- AUDIT LOG TESTS
-- =============================================

-- Test 9: Audit logs are created for changes
SELECT 'TEST 9: Audit log functionality' as test_name;
SELECT COUNT(*) as audit_log_count FROM audit_logs;

-- =============================================
-- PERFORMANCE TESTS
-- =============================================

-- Test 10: Index usage verification
SELECT 'TEST 10: Index usage verification' as test_name;

-- Check if indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'students', 'courses', 'grades')
ORDER BY tablename, indexname;

-- =============================================
-- CLEANUP (Optional)
-- =============================================

-- Uncomment the following to clean up test data
-- DELETE FROM grades WHERE semester = '2023/1' AND academic_year = '2023/2024';
-- DELETE FROM courses WHERE code IN ('TI101', 'SI101');
-- DELETE FROM students WHERE nim LIKE '2023001%';
-- DELETE FROM profiles WHERE full_name LIKE '%User';