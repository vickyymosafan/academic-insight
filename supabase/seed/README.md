# Sample Data for Academic Insight PWA

This directory contains comprehensive sample data for testing and development of the Academic Insight PWA application.

## Overview

The sample data includes:
- **8 User Profiles**: 2 administrators and 6 lecturers
- **40 Students**: Distributed across 4 programs and multiple cohorts (2020-2023)
- **16 Courses**: Covering all 4 study programs
- **100+ Grade Records**: Realistic grade distributions for comprehensive testing

## Data Structure

### Programs (Program Studi)
1. **Teknik Informatika** - 15 students
2. **Sistem Informasi** - 11 students  
3. **Teknik Komputer** - 7 students
4. **Manajemen Informatika** - 7 students

### Student Status Distribution
- **Active (aktif)**: 32 students
- **Graduated (lulus)**: 5 students
- **Dropout**: 2 students
- **On Leave (cuti)**: 1 student

### Cohorts (Angkatan)
- **2023**: 16 students (current semester 3)
- **2022**: 13 students (current semester 5)
- **2021**: 6 students (current semester 7)
- **2020**: 5 students (graduated)

## Files Description

### Core Seed Files
- `001_sample_profiles.sql` - User profiles (admins and lecturers)
- `002_sample_courses.sql` - Course catalog for all programs
- `003_sample_students.sql` - Student records with realistic data
- `004_sample_grades.sql` - Grade records with varied performance patterns

### Utility Scripts
- `run_all_seeds.sql` - Execute all seed files in correct order (additive)
- `000_reset_and_seed.sql` - Complete database reset and fresh seeding
- `README.md` - This documentation file

## Usage Instructions

### Option 1: Fresh Database Setup (Recommended for Development)
```sql
-- Run this to completely reset and populate with fresh data
\i 000_reset_and_seed.sql
```

### Option 2: Add Sample Data to Existing Database
```sql
-- Run this to add sample data without clearing existing data
\i run_all_seeds.sql
```

### Option 3: Individual Files
```sql
-- Run individual files in this order:
\i 001_sample_profiles.sql
\i 002_sample_courses.sql  
\i 003_sample_students.sql
\i 004_sample_grades.sql

-- Then update IPK calculations:
UPDATE students SET ipk = calculate_student_ipk(id);
```

## Sample Data Characteristics

### Realistic Performance Patterns
- **Excellent Students**: Consistent A grades (IPK 3.7-4.0)
- **Good Students**: Mix of A- and B+ grades (IPK 3.2-3.6)
- **Average Students**: B and B- grades (IPK 2.7-3.1)
- **Struggling Students**: C+ and below (IPK 2.0-2.6)
- **Dropout Cases**: Declining performance pattern

### Dashboard Testing Data
The sample data provides realistic statistics for testing:
- Overall graduation rate: ~71%
- Overall dropout rate: ~29%
- Average GPA: ~3.2
- Program-specific variations
- Semester distribution across active students

### Chart Testing Data
- Grade distribution for pie/bar charts
- IPK trends by program
- Student count by semester
- Performance comparison across programs

## User Accounts for Testing

### Administrator Accounts
- **Dr. Ahmad Wijaya** (ID: 550e8400-e29b-41d4-a716-446655440001)
- **Prof. Siti Nurhaliza** (ID: 550e8400-e29b-41d4-a716-446655440002)

### Lecturer Accounts
- **Dr. Budi Santoso** - Teknik Informatika
- **Dr. Rina Kartika** - Sistem Informasi  
- **Prof. Joko Widodo** - Teknik Komputer
- **Dr. Maya Sari** - Manajemen Informatika
- **Dr. Andi Pratama** - Teknik Informatika
- **Dr. Lisa Permata** - Sistem Informasi

## Data Validation

After running the seed scripts, the following validations are performed:
- IPK calculations for all students
- Data integrity checks
- Orphaned record detection
- Summary statistics generation

## Notes for Development

1. **Automatic Calculations**: IPK values are calculated automatically based on grades
2. **Grade Points**: Letter grades are converted to points via database trigger
3. **Realistic Patterns**: Data includes various academic scenarios (excellent, struggling, dropout)
4. **Dashboard Ready**: Statistics are immediately available via `dashboard_stats` view
5. **Chart Ready**: Grade and performance distributions suitable for visualization

## Troubleshooting

If you encounter issues:
1. Ensure all migration files have been run first
2. Check that utility functions exist (`calculate_student_ipk`, etc.)
3. Verify RLS policies are properly configured
4. Use `000_reset_and_seed.sql` for a clean start

## Requirements Fulfilled

This sample data addresses the following requirements:
- **Requirement 2.1**: Dashboard statistics with realistic data
- **Requirement 2.2**: Student performance data for visualization
- **Testing Requirements**: Comprehensive data for all dashboard features
- **Development Requirements**: Realistic scenarios for form testing and CRUD operations