# Row Level Security (RLS) Policies Documentation

## Overview

This document describes the Row Level Security policies implemented for the Academic Insight PWA. RLS ensures that users can only access data they are authorized to see based on their role and relationship to the data.

## User Roles

The system supports two main user roles:

- **admin**: Full access to all data and operations
- **dosen** (lecturer): Limited access based on their assigned courses

## Table-by-Table RLS Policies

### 1. Profiles Table

**Purpose**: Stores user profile information extending auth.users

**Policies**:
- `authenticated_users_can_view_profiles`: All authenticated users can view all profiles
- `users_can_update_own_profile`: Users can only update their own profile
- `users_can_insert_own_profile`: Users can insert their own profile during registration

**Security Logic**:
```sql
-- View: All authenticated users
FOR SELECT TO authenticated USING (true);

-- Update: Only own profile
FOR UPDATE TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Insert: Only own profile
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);
```

### 2. Students Table

**Purpose**: Stores student academic information

**Policies**:
- `authenticated_users_can_view_students`: All authenticated users can view all students
- `only_admins_can_insert_students`: Only admins can add new students
- `only_admins_can_update_students`: Only admins can modify student data
- `only_admins_can_delete_students`: Only admins can delete students

**Security Logic**:
```sql
-- View: All authenticated users
FOR SELECT TO authenticated USING (true);

-- Insert/Update/Delete: Only admins
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 3. Courses Table

**Purpose**: Stores course information and lecturer assignments

**Policies**:
- `authenticated_users_can_view_courses`: All authenticated users can view all courses
- `lecturers_can_manage_own_courses`: Lecturers can manage their assigned courses, admins can manage all
- `only_admins_can_create_courses`: Only admins can create new courses

**Security Logic**:
```sql
-- View: All authenticated users
FOR SELECT TO authenticated USING (true);

-- Manage: Own courses for lecturers, all for admins
FOR ALL TO authenticated 
USING (
    lecturer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create: Only admins
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 4. Grades Table

**Purpose**: Stores student grades for courses

**Policies**:
- `lecturers_can_view_their_course_grades`: Lecturers can view grades for their courses, admins can view all
- `lecturers_can_insert_their_course_grades`: Lecturers can add grades for their courses, admins can add all
- `lecturers_can_update_their_course_grades`: Lecturers can update grades for their courses, admins can update all
- `lecturers_can_delete_their_course_grades`: Lecturers can delete grades for their courses, admins can delete all

**Security Logic**:
```sql
-- All operations: Own courses for lecturers, all for admins
FOR ALL TO authenticated 
USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## Utility Functions

### Security Helper Functions

1. **is_admin()**: Returns true if current user is admin
2. **is_course_lecturer(course_uuid)**: Returns true if current user is lecturer for specified course
3. **get_user_role()**: Returns the role of current user

### Audit Functions

1. **create_audit_log()**: Trigger function that logs all changes to important tables
2. **handle_new_user()**: Trigger function that creates profile when new user registers

## Testing the RLS Policies

### 1. SQL Tests

Run the SQL test files to verify policies:

```bash
# Run basic RLS tests
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/tests/rls_policy_tests.sql

# Run integration tests (requires pgtap extension)
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/tests/rls_integration_tests.sql
```

### 2. TypeScript/JavaScript Tests

Run the comprehensive test suite:

```bash
# Install dependencies
npm install @supabase/supabase-js vitest

# Run RLS tests
npx vitest supabase/tests/rls-policies.test.ts
```

### 3. Manual Testing Scenarios

#### Scenario 1: Admin User
```javascript
// Admin should be able to:
// - View all profiles, students, courses, grades
// - Insert/update/delete students
// - Create courses
// - Manage all grades

const adminClient = createClient(url, key, { 
  global: { headers: { Authorization: `Bearer ${adminToken}` } } 
});

// Test admin access
const { data: students } = await adminClient.from('students').select('*');
const { data: newStudent } = await adminClient.from('students').insert({...});
```

#### Scenario 2: Lecturer User
```javascript
// Lecturer should be able to:
// - View all profiles, students, courses
// - NOT insert/update/delete students
// - Update only their assigned courses
// - Manage grades only for their courses

const lecturerClient = createClient(url, key, { 
  global: { headers: { Authorization: `Bearer ${lecturerToken}` } } 
});

// Test lecturer limitations
const { error } = await lecturerClient.from('students').insert({...}); // Should fail
const { data: ownGrades } = await lecturerClient.from('grades').select('*'); // Should only return their course grades
```

## Performance Considerations

### Indexes for RLS Performance

The following indexes are created to optimize RLS policy checks:

```sql
-- Profile role checks
CREATE INDEX idx_profiles_user_role ON profiles(id, role);

-- Course lecturer checks
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);

-- General performance indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department);
```

### Query Optimization Tips

1. **Use specific selects**: Always specify columns instead of `SELECT *`
2. **Filter early**: Apply filters that align with RLS policies
3. **Use joins wisely**: Join with courses table when checking lecturer permissions
4. **Monitor performance**: Use `EXPLAIN ANALYZE` to check query plans

## Security Best Practices

### 1. Defense in Depth
- RLS policies are the primary security layer
- Application-level checks provide additional validation
- API routes should validate permissions before database operations

### 2. Principle of Least Privilege
- Users only get minimum required permissions
- Lecturers can only access their assigned courses
- Admins have full access but actions are audited

### 3. Audit Trail
- All changes to critical tables are logged
- Audit logs are only accessible to admins
- User actions are tracked with timestamps

### 4. Regular Security Reviews
- Review RLS policies during code reviews
- Test policies with different user scenarios
- Monitor audit logs for suspicious activity

## Troubleshooting Common Issues

### 1. Policy Not Working
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policy definitions
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 2. Performance Issues
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE SELECT * FROM students WHERE program_studi = 'Teknik Informatika';

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%students%' 
ORDER BY mean_time DESC;
```

### 3. Authentication Context Issues
```sql
-- Check current user context
SELECT auth.uid(), auth.role();

-- Verify profile exists
SELECT * FROM profiles WHERE id = auth.uid();
```

## Migration and Deployment

### 1. Applying RLS Policies
```bash
# Apply all migrations in order
supabase db push

# Or apply specific migration
supabase migration up --target-version 006
```

### 2. Testing in Different Environments
```bash
# Local development
supabase start
npm run test:rls

# Staging
supabase link --project-ref staging-project-id
supabase db push
npm run test:rls:staging

# Production
supabase link --project-ref production-project-id
supabase db push
npm run test:rls:production
```

### 3. Rollback Procedures
```sql
-- Disable RLS if needed (emergency only)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Drop specific policy
DROP POLICY "policy_name" ON table_name;

-- Recreate policy with fixes
CREATE POLICY "policy_name" ON table_name FOR ALL TO authenticated USING (...);
```

## Monitoring and Maintenance

### 1. Regular Checks
- Monitor RLS policy performance monthly
- Review audit logs weekly
- Test with new user scenarios quarterly

### 2. Metrics to Track
- Query performance for RLS-enabled tables
- Number of policy violations (should be zero)
- Audit log growth rate

### 3. Alerting
- Set up alerts for policy violations
- Monitor for unusual access patterns
- Alert on performance degradation

## Conclusion

The RLS policies implemented provide comprehensive security for the Academic Insight PWA while maintaining good performance. Regular testing and monitoring ensure the policies continue to work as expected as the application evolves.