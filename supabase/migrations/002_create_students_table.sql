-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  program_studi TEXT NOT NULL,
  angkatan INTEGER NOT NULL,
  status TEXT CHECK (status IN ('aktif', 'lulus', 'dropout', 'cuti')) DEFAULT 'aktif',
  ipk DECIMAL(3,2) DEFAULT 0.00 CHECK (ipk >= 0.00 AND ipk <= 4.00),
  semester_current INTEGER DEFAULT 1 CHECK (semester_current >= 1 AND semester_current <= 14),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_students_program_studi ON students(program_studi);
CREATE INDEX idx_students_angkatan ON students(angkatan);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_ipk ON students(ipk);
CREATE INDEX idx_students_semester ON students(semester_current);

-- Composite index for common queries
CREATE INDEX idx_students_program_angkatan ON students(program_studi, angkatan);
CREATE INDEX idx_students_status_program ON students(status, program_studi);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();