-- Master seed script to populate database with sample data
-- Run this script to populate the database with comprehensive test data
-- This script will ADD data to existing database (use 000_reset_and_seed.sql to reset first)

-- Note: This script assumes the migration files have been run first
-- and all tables and functions are properly created

BEGIN;

-- Insert sample profiles (will skip if already exist due to UUID conflicts)
INSERT INTO profiles (id, full_name, avatar_url, department, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dr. Ahmad Wijaya', NULL, 'Fakultas Teknik Informatika', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Prof. Siti Nurhaliza', NULL, 'Fakultas Teknik Informatika', 'admin'),
('550e8400-e29b-41d4-a716-446655440003', 'Dr. Budi Santoso', NULL, 'Jurusan Teknik Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440004', 'Dr. Rina Kartika', NULL, 'Jurusan Sistem Informasi', 'dosen'),
('550e8400-e29b-41d4-a716-446655440005', 'Prof. Joko Widodo', NULL, 'Jurusan Teknik Komputer', 'dosen'),
('550e8400-e29b-41d4-a716-446655440006', 'Dr. Maya Sari', NULL, 'Jurusan Manajemen Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440007', 'Dr. Andi Pratama', NULL, 'Jurusan Teknik Informatika', 'dosen'),
('550e8400-e29b-41d4-a716-446655440008', 'Dr. Lisa Permata', NULL, 'Jurusan Sistem Informasi', 'dosen')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
\i 002_sample_courses.sql

-- Insert sample students  
\i 003_sample_students.sql

-- Insert sample grades (this will automatically calculate grade_point via trigger)
\i 004_sample_grades.sql

-- Update all student IPK values based on their grades
UPDATE students SET ipk = calculate_student_ipk(id);

-- Display summary statistics
SELECT 'Data seeding completed successfully!' as status;

-- Summary by table
SELECT 
    'Profiles' as table_name,
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
    COUNT(*) FILTER (WHERE role = 'dosen') as lecturer_count
FROM profiles

UNION ALL

SELECT 
    'Students' as table_name,
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE status = 'aktif') as active_count,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated_count
FROM students

UNION ALL

SELECT 
    'Courses' as table_name,
    COUNT(*) as record_count,
    NULL as active_count,
    NULL as graduated_count
FROM courses

UNION ALL

SELECT 
    'Grades' as table_name,
    COUNT(*) as record_count,
    NULL as active_count,
    NULL as graduated_count
FROM grades;

-- Display program distribution for dashboard testing
SELECT 
    program_studi,
    COUNT(*) as total_students,
    ROUND(AVG(ipk), 2) as avg_ipk,
    COUNT(*) FILTER (WHERE status = 'aktif') as active,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated,
    COUNT(*) FILTER (WHERE status = 'dropout') as dropout,
    COUNT(*) FILTER (WHERE status = 'cuti') as on_leave
FROM students
GROUP BY program_studi
ORDER BY program_studi;

-- Display dashboard statistics for testing
SELECT 
    'Dashboard Statistics:' as info,
    total_students,
    active_students,
    graduated_students,
    dropout_students,
    on_leave_students,
    average_gpa,
    graduation_rate,
    dropout_rate
FROM dashboard_stats;

-- Display semester distribution for chart testing
SELECT 
    'Semester Distribution:' as info,
    semester_current,
    COUNT(*) as student_count
FROM students 
WHERE status = 'aktif'
GROUP BY semester_current
ORDER BY semester_current;

-- Display grade distribution for chart testing
SELECT 
    'Grade Distribution:' as info,
    grade,
    COUNT(*) as grade_count
FROM grades
GROUP BY grade
ORDER BY 
    CASE grade
        WHEN 'A' THEN 1 WHEN 'A-' THEN 2 WHEN 'B+' THEN 3 WHEN 'B' THEN 4 WHEN 'B-' THEN 5
        WHEN 'C+' THEN 6 WHEN 'C' THEN 7 WHEN 'C-' THEN 8 WHEN 'D+' THEN 9 WHEN 'D' THEN 10 WHEN 'E' THEN 11
    END;

COMMIT;