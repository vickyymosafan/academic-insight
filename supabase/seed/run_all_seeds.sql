-- Master seed script to populate database with sample data
-- Run this script to populate the database with comprehensive test data

-- Note: This script assumes the migration files have been run first
-- and all tables and functions are properly created

BEGIN;

-- Insert sample profiles
\i 001_sample_profiles.sql

-- Insert sample courses
\i 002_sample_courses.sql

-- Insert sample students
\i 003_sample_students.sql

-- Insert sample grades (this will automatically calculate IPK)
\i 004_sample_grades.sql

-- Verify data integrity and update any missing IPK values
UPDATE students SET ipk = calculate_student_ipk(id) WHERE ipk = 0.00;

-- Display summary statistics
SELECT 'Data seeding completed successfully!' as status;

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

-- Display program distribution
SELECT 
    program_studi,
    COUNT(*) as total_students,
    ROUND(AVG(ipk), 2) as avg_ipk,
    COUNT(*) FILTER (WHERE status = 'aktif') as active,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated,
    COUNT(*) FILTER (WHERE status = 'dropout') as dropout
FROM students
GROUP BY program_studi
ORDER BY program_studi;

-- Display dashboard statistics
SELECT * FROM dashboard_stats;

COMMIT;