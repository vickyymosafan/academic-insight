-- Create grades table
CREATE TABLE grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  grade VARCHAR(2) NOT NULL CHECK (grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E')),
  grade_point DECIMAL(3,2) NOT NULL CHECK (grade_point >= 0.00 AND grade_point <= 4.00),
  semester VARCHAR(10) NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of student, course, semester, and academic year
  UNIQUE(student_id, course_id, semester, academic_year)
);

-- Create indexes for performance optimization
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_course_id ON grades(course_id);
CREATE INDEX idx_grades_semester ON grades(semester);
CREATE INDEX idx_grades_academic_year ON grades(academic_year);
CREATE INDEX idx_grades_grade_point ON grades(grade_point);

-- Composite indexes for common queries
CREATE INDEX idx_grades_student_semester ON grades(student_id, semester, academic_year);
CREATE INDEX idx_grades_course_semester ON grades(course_id, semester, academic_year);

-- Enable RLS
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_grades_updated_at 
    BEFORE UPDATE ON grades 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate grade_point from grade
CREATE OR REPLACE FUNCTION calculate_grade_point(grade_letter VARCHAR(2))
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN CASE grade_letter
        WHEN 'A' THEN 4.00
        WHEN 'A-' THEN 3.70
        WHEN 'B+' THEN 3.30
        WHEN 'B' THEN 3.00
        WHEN 'B-' THEN 2.70
        WHEN 'C+' THEN 2.30
        WHEN 'C' THEN 2.00
        WHEN 'C-' THEN 1.70
        WHEN 'D+' THEN 1.30
        WHEN 'D' THEN 1.00
        WHEN 'E' THEN 0.00
        ELSE 0.00
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate grade_point
CREATE OR REPLACE FUNCTION set_grade_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade_point = calculate_grade_point(NEW.grade);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_point_trigger
    BEFORE INSERT OR UPDATE ON grades
    FOR EACH ROW
    EXECUTE FUNCTION set_grade_point();