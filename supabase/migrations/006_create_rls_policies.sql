-- Row Level Security Policies

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Policy: Public profiles are viewable by authenticated users
CREATE POLICY "authenticated_users_can_view_profiles" ON profiles
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for registration)
CREATE POLICY "users_can_insert_own_profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- =============================================
-- STUDENTS TABLE POLICIES
-- =============================================

-- Policy: Authenticated users can view all students
CREATE POLICY "authenticated_users_can_view_students" ON students
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Only admins can insert students
CREATE POLICY "only_admins_can_insert_students" ON students
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can update students
CREATE POLICY "only_admins_can_update_students" ON students
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can delete students
CREATE POLICY "only_admins_can_delete_students" ON students
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- COURSES TABLE POLICIES
-- =============================================

-- Policy: Authenticated users can view all courses
CREATE POLICY "authenticated_users_can_view_courses" ON courses
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Lecturers can view and manage their own courses
CREATE POLICY "lecturers_can_manage_own_courses" ON courses
    FOR ALL TO authenticated
    USING (
        lecturer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        lecturer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can create new courses
CREATE POLICY "only_admins_can_create_courses" ON courses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- GRADES TABLE POLICIES
-- =============================================

-- Policy: Lecturers can view grades for their courses, admins can view all
CREATE POLICY "lecturers_can_view_their_course_grades" ON grades
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Lecturers can insert grades for their courses, admins can insert all
CREATE POLICY "lecturers_can_insert_their_course_grades" ON grades
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Lecturers can update grades for their courses, admins can update all
CREATE POLICY "lecturers_can_update_their_course_grades" ON grades
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Lecturers can delete grades for their courses, admins can delete all
CREATE POLICY "lecturers_can_delete_their_course_grades" ON grades
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = grades.course_id AND c.lecturer_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );