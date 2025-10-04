-- Complete database reset and seeding script
-- This script will clear all existing data and populate with fresh sample data
-- WARNING: This will delete all existing data in the database

BEGIN;

-- Disable triggers temporarily to avoid conflicts during bulk operations
SET session_replication_role = replica;

-- Clear existing data in reverse dependency order
TRUNCATE TABLE grades CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Insert sample data in correct order
\i 001_sample_profiles.sql
\i 002_sample_courses.sql
\i 003_sample_students.sql
\i 004_sample_grades.sql

-- Update all student IPK values based on their grades
UPDATE students SET ipk = calculate_student_ipk(id);

-- Verify data integrity
DO $
BEGIN
    -- Check for students without IPK calculation
    IF EXISTS (SELECT 1 FROM students WHERE ipk = 0.00 AND id IN (SELECT DISTINCT student_id FROM grades)) THEN
        RAISE WARNING 'Some students have grades but IPK is 0.00. Manual IPK calculation may be needed.';
    END IF;
    
    -- Check for orphaned grades
    IF EXISTS (SELECT 1 FROM grades g WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = g.student_id)) THEN
        RAISE WARNING 'Found orphaned grades without corresponding students.';
    END IF;
    
    -- Check for orphaned courses in grades
    IF EXISTS (SELECT 1 FROM grades g WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = g.course_id)) THEN
        RAISE WARNING 'Found grades referencing non-existent courses.';
    END IF;
END
$;

-- Display comprehensive summary
SELECT 'DATABASE SEEDING COMPLETED SUCCESSFULLY!' as status;

-- Summary statistics
SELECT 
    'PROFILES' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
    COUNT(*) FILTER (WHERE role = 'dosen') as lecturer_count
FROM profiles

UNION ALL

SELECT 
    'STUDENTS' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'aktif') as active_count,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated_count
FROM students

UNION ALL

SELECT 
    'COURSES' as table_name,
    COUNT(*) as total_records,
    NULL as active_count,
    NULL as graduated_count
FROM courses

UNION ALL

SELECT 
    'GRADES' as table_name,
    COUNT(*) as total_records,
    NULL as active_count,
    NULL as graduated_count
FROM grades;

-- Program distribution with statistics
SELECT 
    '=== PROGRAM DISTRIBUTION ===' as section,
    NULL as program_studi,
    NULL as total_students,
    NULL as avg_ipk,
    NULL as active,
    NULL as graduated,
    NULL as dropout

UNION ALL

SELECT 
    NULL as section,
    program_studi,
    COUNT(*)::TEXT as total_students,
    ROUND(AVG(ipk), 2)::TEXT as avg_ipk,
    COUNT(*) FILTER (WHERE status = 'aktif')::TEXT as active,
    COUNT(*) FILTER (WHERE status = 'lulus')::TEXT as graduated,
    COUNT(*) FILTER (WHERE status = 'dropout')::TEXT as dropout
FROM students
GROUP BY program_studi
ORDER BY program_studi;

-- Dashboard statistics view
SELECT 
    '=== DASHBOARD STATISTICS ===' as section,
    NULL as metric,
    NULL as value

UNION ALL

SELECT 
    NULL as section,
    'Total Students' as metric,
    total_students::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Active Students' as metric,
    active_students::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Graduated Students' as metric,
    graduated_students::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Dropout Students' as metric,
    dropout_students::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Average GPA' as metric,
    average_gpa::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Graduation Rate (%)' as metric,
    graduation_rate::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Dropout Rate (%)' as metric,
    dropout_rate::TEXT as value
FROM dashboard_stats;

-- Grade distribution for testing charts
SELECT 
    '=== GRADE DISTRIBUTION ===' as section,
    NULL as grade,
    NULL as count

UNION ALL

SELECT 
    NULL as section,
    grade,
    COUNT(*)::TEXT as count
FROM grades
GROUP BY grade
ORDER BY 
    CASE grade
        WHEN 'A' THEN 1
        WHEN 'A-' THEN 2
        WHEN 'B+' THEN 3
        WHEN 'B' THEN 4
        WHEN 'B-' THEN 5
        WHEN 'C+' THEN 6
        WHEN 'C' THEN 7
        WHEN 'C-' THEN 8
        WHEN 'D+' THEN 9
        WHEN 'D' THEN 10
        WHEN 'E' THEN 11
    END;

COMMIT;