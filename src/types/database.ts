// Database Types for Academic Insight PWA

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>;
            };
            students: {
                Row: Student;
                Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>;
            };
            courses: {
                Row: Course;
                Insert: Omit<Course, 'id' | 'created_at'>;
                Update: Partial<Omit<Course, 'id' | 'created_at'>>;
            };
            grades: {
                Row: Grade;
                Insert: Omit<Grade, 'id' | 'created_at'>;
                Update: Partial<Omit<Grade, 'id' | 'created_at'>>;
            };
        };
    };
}

// Core Data Models
export interface Profile {
    id: string;
    full_name: string;
    avatar_url?: string;
    department?: string;
    role: 'dosen' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    nim: string;
    name: string;
    program_studi: string;
    angkatan: number;
    status: 'aktif' | 'lulus' | 'dropout' | 'cuti';
    ipk: number;
    semester_current: number;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    semester: number;
    program_studi: string;
    lecturer_id: string;
    created_at: string;
}

export interface Grade {
    id: string;
    student_id: string;
    course_id: string;
    grade: string;
    grade_point: number;
    semester: string;
    academic_year: string;
    created_at: string;
}