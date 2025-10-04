-- Create utility functions for academic calculations

-- Function to calculate student's current IPK
CREATE OR REPLACE FUNCTION calculate_student_ipk(student_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_credits INTEGER := 0;
    total_points DECIMAL := 0;
    calculated_ipk DECIMAL(3,2);
BEGIN
    SELECT 
        COALESCE(SUM(c.credits), 0),
        COALESCE(SUM(g.grade_point * c.credits), 0)
    INTO total_credits, total_points
    FROM grades g
    JOIN courses c ON g.course_id = c.id
    WHERE g.student_id = student_uuid;
    
    IF total_credits = 0 THEN
        RETURN 0.00;
    END IF;
    
    calculated_ipk := total_points / total_credits;
    RETURN ROUND(calculated_ipk, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update student IPK after grade changes
CREATE OR REPLACE FUNCTION update_student_ipk()
RETURNS TRIGGER AS $$
BEGIN
    -- Update IPK for the affected student
    UPDATE students 
    SET ipk = calculate_student_ipk(COALESCE(NEW.student_id, OLD.student_id))
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update student IPK when grades change
CREATE TRIGGER update_ipk_on_grade_change
    AFTER INSERT OR UPDATE OR DELETE ON grades
    FOR EACH ROW
    EXECUTE FUNCTION update_student_ipk();

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE status = 'aktif') as active_students,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated_students,
    COUNT(*) FILTER (WHERE status = 'dropout') as dropout_students,
    COUNT(*) FILTER (WHERE status = 'cuti') as on_leave_students,
    ROUND(AVG(ipk), 2) as average_gpa,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'lulus')::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE status IN ('lulus', 'dropout')), 0)) * 100, 
        2
    ) as graduation_rate,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'dropout')::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE status IN ('lulus', 'dropout')), 0)) * 100, 
        2
    ) as dropout_rate
FROM students;

-- Create view for program statistics
CREATE OR REPLACE VIEW program_stats AS
SELECT 
    program_studi,
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE status = 'aktif') as active_students,
    COUNT(*) FILTER (WHERE status = 'lulus') as graduated_students,
    COUNT(*) FILTER (WHERE status = 'dropout') as dropout_students,
    ROUND(AVG(ipk), 2) as average_gpa,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'lulus')::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE status IN ('lulus', 'dropout')), 0)) * 100, 
        2
    ) as graduation_rate
FROM students
GROUP BY program_studi;

-- Create view for semester distribution
CREATE OR REPLACE VIEW semester_distribution AS
SELECT 
    semester_current,
    COUNT(*) as student_count,
    program_studi
FROM students
WHERE status = 'aktif'
GROUP BY semester_current, program_studi
ORDER BY semester_current, program_studi;