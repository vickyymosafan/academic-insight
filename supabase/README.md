# Academic Insight PWA - Database Setup

This directory contains all the database migration and seed files for the Academic Insight PWA project.

## Directory Structure

```
supabase/
├── migrations/          # Database schema migrations
├── seed/               # Sample data for development/testing
├── tests/              # Database testing scripts
└── README.md           # This file
```

## Migration Files

Run these files in order to set up the database schema:

1. **001_create_profiles_table.sql** - Creates user profiles table with roles
2. **002_create_students_table.sql** - Creates students table with academic data
3. **003_create_courses_table.sql** - Creates courses table
4. **004_create_grades_table.sql** - Creates grades table with automatic GPA calculation
5. **005_create_utility_functions.sql** - Creates utility functions and views
6. **006_create_rls_policies.sql** - Implements Row Level Security policies
7. **007_additional_security.sql** - Additional security features and audit logging

## Seed Files

Sample data for development and testing:

1. **001_sample_profiles.sql** - Sample user profiles (admin and lecturers)
2. **002_sample_courses.sql** - Sample courses for all programs
3. **003_sample_students.sql** - Sample students with various statuses
4. **004_sample_grades.sql** - Sample grades with realistic distributions
5. **run_all_seeds.sql** - Master script to run all seed files

## How to Use

### Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase project (if not already done)
supabase init

# Start local development
supabase start

# Run migrations
supabase db reset

# Or run individual migrations
supabase db push
```

### Manual Database Setup

If running manually in Supabase dashboard or psql:

1. **Run Migration Files** (in order):
   ```sql
   -- Copy and paste each migration file content in order
   -- 001_create_profiles_table.sql
   -- 002_create_students_table.sql
   -- ... and so on
   ```

2. **Run Seed Files** (optional, for development):
   ```sql
   -- Run seed files to populate with sample data
   -- 001_sample_profiles.sql
   -- 002_sample_courses.sql
   -- ... and so on
   ```

### Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Overview

### Tables

- **profiles** - User profiles extending auth.users
- **students** - Student academic records
- **courses** - Course catalog
- **grades** - Student grades with automatic GPA calculation
- **audit_logs** - Audit trail for data changes

### Key Features

- **Row Level Security (RLS)** - Role-based access control
- **Automatic GPA Calculation** - Triggers update student IPK when grades change
- **Audit Logging** - Tracks all data modifications
- **Real-time Subscriptions** - Ready for real-time updates
- **Performance Optimization** - Proper indexes for common queries

### User Roles

- **admin** - Full access to all data and management functions
- **dosen** - Access to their own courses and student grades

## Testing

Use the test file to verify RLS policies:

```sql
-- Run the test script
\i tests/rls_test.sql
```

## Sample Data Overview

The seed data includes:

- **8 User Profiles** (2 admins, 6 lecturers)
- **16 Courses** across 4 programs
- **40 Students** with various statuses and academic years
- **50+ Grade Records** with realistic distributions

### Programs Included

1. **Teknik Informatika** - 15 students
2. **Sistem Informasi** - 11 students  
3. **Teknik Komputer** - 7 students
4. **Manajemen Informatika** - 7 students

### Student Status Distribution

- **Active Students** - Currently enrolled
- **Graduated Students** - Completed their studies
- **Dropout Students** - Left the program
- **On Leave Students** - Temporarily suspended

## Security Notes

- All tables have RLS enabled
- Policies enforce role-based access control
- Audit logging tracks all data changes
- Input validation at database level
- Secure functions with SECURITY DEFINER

## Troubleshooting

### Common Issues

1. **Permission Denied** - Check if RLS policies are correctly applied
2. **Function Not Found** - Ensure migration files ran in correct order
3. **Foreign Key Violations** - Check if referenced records exist

### Debugging RLS

```sql
-- Check current user and role
SELECT auth.uid(), get_user_role();

-- Test policy with specific user context
SET LOCAL role = 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub":"user-uuid-here"}';
```

## Performance Considerations

- Indexes are created for common query patterns
- Views are provided for dashboard statistics
- Functions use proper security context
- Triggers are optimized for minimal overhead

For more information, refer to the design document in `.kiro/specs/academic-insight-pwa/design.md`.