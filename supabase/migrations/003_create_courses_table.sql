-- Create courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits >= 1 AND credits <= 6),
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  program_studi TEXT NOT NULL,
  lecturer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_program_studi ON courses(program_studi);
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);

-- Composite index for common queries
CREATE INDEX idx_courses_program_semester ON courses(program_studi, semester);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();