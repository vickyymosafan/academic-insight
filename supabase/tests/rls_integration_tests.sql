-- RLS Integration Tests with User Context Simulation
-- This file contains comprehensive tests for Row Level Security policies

BEGIN;

-- Create test extension for testing
CREATE EXTENSION IF NOT EXISTS pgtap;

-- =============================================
-- TEST HELPER FUNCTIONS
-- =============================================

-- Function to simulate user authentication context
CREATE OR REPLACE FUNCTION simulate_user_auth(user_uuid UUID)
RETURNS VOID AS $
BEGIN
    -- This simulates setting the auth.uid() context
    PERFORM set_config('request.jwt.claim.sub', user_uuid::text, true);
END;
$ LANGUAGE plpgsql;

-- Function to clear auth context
CREATE OR REPLACE FUNCTION clear_auth_context()
RETURNS VOID AS $
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$ LANGUAGE plpgsql;

-- =============================================
-- TEST DATA SETUP
-- =============================================

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@test.com', 'encrypted', NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'lecturer@test.com', 'encrypted', NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'lecturer2@test.com', 'encrypted', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test profiles
INSERT INTO profiles (id, full_name, role, department) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Test Admin', 'admin', 'Administration'),
    ('22222222-2222-2222-2222-222222222222', 'Test Lecturer 1', 'dosen', 'Computer Science'),
    ('33333333-3333-3333-3333-333333333333', 'Test Lecturer 2', 'dosen', 'Information Systems')
ON CONFLICT (id) DO NOTHING;

-- Create test students
INSERT INTO students (id, nim, name, program_studi, angkatan, ipk, semester_current) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TEST001', 'Test Student 1', 'Teknik Informatika', 2023, 3.50, 3),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TEST002', 'Test Student 2', 'Sistem Informasi', 2023, 3.25, 3)
ON CONFLICT (id) DO NOTHING;

-- Create test courses
INSERT INTO courses (id, code, name, credits, semester, program_studi, lecturer_id) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEST101', 'Test Course 1', 3, 1, 'Teknik Informatika', '22222222-2222-2222-2222-222222222222'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'TEST102', 'Test Course 2', 3, 1, 'Sistem Informasi', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Create test grades
INSERT INTO grades (student_id, course_id, grade, semester, academic_year) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'A', '2023/1', '2023/2024'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'B+', '2023/1', '2023/2024')
ON CONFLICT (student_id, course_id, semester, academic_year) DO NOTHING;

-- =============================================
-- PROFILES TABLE TESTS
-- =============================================

SELECT plan(12); -- Number of tests

-- Test 1: Authenticated users can view all profiles
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
SELECT ok(
    (SELECT COUNT(*) FROM profiles) >= 3,
    'Authenticated users can view all profiles'
);

-- Test 2: Users can update their own profile
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
UPDATE profiles SET department = 'Updated Department' WHERE id = '22222222-2222-2222-2222-222222222222';
SELECT ok(
    (SELECT department FROM profiles WHERE id = '22222222-2222-2222-2222-222222222222') = 'Updated Department',
    'Users can update their own profile'
);

-- Test 3: Users cannot update other profiles (this should fail silently due to RLS)
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
UPDATE profiles SET department = 'Hacked Department' WHERE id = '11111111-1111-1111-1111-111111111111';
SELECT ok(
    (SELECT department FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111') != 'Hacked Department',
    'Users cannot update other profiles'
);

-- =============================================
-- STUDENTS TABLE TESTS
-- =============================================

-- Test 4: All authenticated users can view students
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
SELECT ok(
    (SELECT COUNT(*) FROM students) >= 2,
    'All authenticated users can view students'
);

-- Test 5: Only admins can insert students
SELECT simulate_user_auth('11111111-1111-1111-1111-111111111111'); -- Admin user
INSERT INTO students (nim, name, program_studi, angkatan) VALUES ('ADMIN001', 'Admin Insert Test', 'Test Program', 2024);
SELECT ok(
    (SELECT COUNT(*) FROM students WHERE nim = 'ADMIN001') = 1,
    'Admins can insert students'
);

-- Test 6: Lecturers cannot insert students
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222'); -- Lecturer user
BEGIN;
    INSERT INTO students (nim, name, program_studi, angkatan) VALUES ('LECTURER001', 'Lecturer Insert Test', 'Test Program', 2024);
    SELECT ok(
        (SELECT COUNT(*) FROM students WHERE nim = 'LECTURER001') = 0,
        'Lecturers cannot insert students'
    );
EXCEPTION WHEN insufficient_privilege THEN
    SELECT ok(true, 'Lecturers cannot insert students - RLS blocked the insert');
END;

-- Test 7: Only admins can update students
SELECT simulate_user_auth('11111111-1111-1111-1111-111111111111'); -- Admin user
UPDATE students SET name = 'Updated by Admin' WHERE nim = 'TEST001';
SELECT ok(
    (SELECT name FROM students WHERE nim = 'TEST001') = 'Updated by Admin',
    'Admins can update students'
);

-- =============================================
-- COURSES TABLE TESTS
-- =============================================

-- Test 8: All authenticated users can view courses
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
SELECT ok(
    (SELECT COUNT(*) FROM courses) >= 2,
    'All authenticated users can view courses'
);

-- Test 9: Lecturers can update their own courses
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
UPDATE courses SET name = 'Updated Course Name' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
SELECT ok(
    (SELECT name FROM courses WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc') = 'Updated Course Name',
    'Lecturers can update their own courses'
);

-- Test 10: Lecturers cannot update other lecturers courses
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
UPDATE courses SET name = 'Hacked Course Name' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
SELECT ok(
    (SELECT name FROM courses WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd') != 'Hacked Course Name',
    'Lecturers cannot update other lecturers courses'
);

-- =============================================
-- GRADES TABLE TESTS
-- =============================================

-- Test 11: Lecturers can view grades for their courses
SELECT simulate_user_auth('22222222-2222-2222-2222-222222222222');
SELECT ok(
    (SELECT COUNT(*) FROM grades g JOIN courses c ON g.course_id = c.id WHERE c.lecturer_id = '22222222-2222-2222-2222-222222222222') >= 1,
    'Lecturers can view grades for their courses'
);

-- Test 12: Admins can view all grades
SELECT simulate_user_auth('11111111-1111-1111-1111-111111111111');
SELECT ok(
    (SELECT COUNT(*) FROM grades) >= 2,
    'Admins can view all grades'
);

-- =============================================
-- CLEANUP
-- =============================================

-- Clean up test data
DELETE FROM grades WHERE semester = '2023/1' AND academic_year = '2023/2024';
DELETE FROM courses WHERE code LIKE 'TEST%';
DELETE FROM students WHERE nim LIKE 'TEST%' OR nim LIKE 'ADMIN%' OR nim LIKE 'LECTURER%';
DELETE FROM profiles WHERE full_name LIKE 'Test %';
DELETE FROM auth.users WHERE email LIKE '%@test.com';

SELECT clear_auth_context();

SELECT * FROM finish();

ROLLBACK;