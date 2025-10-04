-- Verification script for sample data
-- Run this script to verify that sample data has been loaded correctly

-- Check if all tables have data
SELECT 
    'TABLE RECORD COUNTS' as section,
    NULL as table_name,
    NULL as record_count,
    NULL as details;

SELECT 
    NULL as section,
    'profiles' as table_name,
    COUNT(*)::TEXT as record_count,
    CONCAT(
        COUNT(*) FILTER (WHERE role = 'admin'), ' admins, ',
        COUNT(*) FILTER (WHERE role = 'dosen'), ' lecturers'
    ) as details
FROM profiles

UNION ALL

SELECT 
    NULL as section,
    'students' as table_name,
    COUNT(*)::TEXT as record_count,
    CONCAT(
        COUNT(*) FILTER (WHERE status = 'aktif'), ' active, ',
        COUNT(*) FILTER (WHERE status = 'lulus'), ' graduated, ',
        COUNT(*) FILTER (WHERE status = 'dropout'), ' dropout'
    ) as details
FROM students

UNION ALL

SELECT 
    NULL as section,
    'courses' as table_name,
    COUNT(*)::TEXT as record_count,
    CONCAT('Across ', COUNT(DISTINCT program_studi), ' programs') as details
FROM courses

UNION ALL

SELECT 
    NULL as section,
    'grades' as table_name,
    COUNT(*)::TEXT as record_count,
    CONCAT('For ', COUNT(DISTINCT student_id), ' students') as details
FROM grades;

-- Check IPK calculations
SELECT 
    'IPK VERIFICATION' as section,
    NULL as student_name,
    NULL as calculated_ipk,
    NULL as stored_ipk,
    NULL as status;

SELECT 
    NULL as section,
    s.name as student_name,
    ROUND(calculate_student_ipk(s.id), 2)::TEXT as calculated_ipk,
    s.ipk::TEXT as stored_ipk,
    CASE 
        WHEN ABS(calculate_student_ipk(s.id) - s.ipk) < 0.01 THEN 'OK'
        ELSE 'MISMATCH'
    END as status
FROM students s
WHERE s.id IN (
    SELECT DISTINCT student_id FROM grades LIMIT 10
)
ORDER BY s.name;

-- Check dashboard statistics
SELECT 
    'DASHBOARD STATISTICS' as section,
    NULL as metric,
    NULL as value;

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
    'Average GPA' as metric,
    average_gpa::TEXT as value
FROM dashboard_stats

UNION ALL

SELECT 
    NULL as section,
    'Graduation Rate' as metric,
    CONCAT(graduation_rate, '%') as value
FROM dashboard_stats;

-- Check program distribution
SELECT 
    'PROGRAM DISTRIBUTION' as section,
    NULL as program,
    NULL as students,
    NULL as avg_gpa;

SELECT 
    NULL as section,
    program_studi as program,
    total_students::TEXT as students,
    average_gpa::TEXT as avg_gpa
FROM program_stats
ORDER BY program_studi;

-- Check for data integrity issues
SELECT 
    'DATA INTEGRITY CHECKS' as section,
    NULL as check_type,
    NULL as result;

SELECT 
    NULL as section,
    'Students without grades' as check_type,
    COUNT(*)::TEXT as result
FROM students s
WHERE s.status = 'aktif' 
AND s.id NOT IN (SELECT DISTINCT student_id FROM grades)

UNION ALL

SELECT 
    NULL as section,
    'Grades without students' as check_type,
    COUNT(*)::TEXT as result
FROM grades g
WHERE g.student_id NOT IN (SELECT id FROM students)

UNION ALL

SELECT 
    NULL as section,
    'Grades without courses' as check_type,
    COUNT(*)::TEXT as result
FROM grades g
WHERE g.course_id NOT IN (SELECT id FROM courses)

UNION ALL

SELECT 
    NULL as section,
    'Students with IPK = 0 but have grades' as check_type,
    COUNT(*)::TEXT as result
FROM students s
WHERE s.ipk = 0.00 
AND s.id IN (SELECT DISTINCT student_id FROM grades);

-- Sample queries for testing dashboard functionality
SELECT 
    'SAMPLE DASHBOARD QUERIES' as section,
    NULL as query_type,
    NULL as sample_result;

-- Grade distribution for charts
SELECT 
    NULL as section,
    'Grade Distribution' as query_type,
    CONCAT(grade, ': ', COUNT(*), ' grades') as sample_result
FROM grades
GROUP BY grade
ORDER BY 
    CASE grade
        WHEN 'A' THEN 1 WHEN 'A-' THEN 2 WHEN 'B+' THEN 3 WHEN 'B' THEN 4 WHEN 'B-' THEN 5
        WHEN 'C+' THEN 6 WHEN 'C' THEN 7 WHEN 'C-' THEN 8 WHEN 'D+' THEN 9 WHEN 'D' THEN 10 WHEN 'E' THEN 11
    END
LIMIT 5

UNION ALL

-- Semester distribution
SELECT 
    NULL as section,
    'Semester Distribution' as query_type,
    CONCAT('Semester ', semester_current, ': ', COUNT(*), ' students') as sample_result
FROM students
WHERE status = 'aktif'
GROUP BY semester_current
ORDER BY semester_current
LIMIT 5;

SELECT 'VERIFICATION COMPLETED' as final_status;