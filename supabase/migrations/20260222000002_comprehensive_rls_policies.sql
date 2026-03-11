-- =============================================
-- COMPREHENSIVE RLS POLICIES FOR ALL TABLES
-- Computer-Aided Timetable System
-- Version: 2.0.0
-- Date: 2026-02-22
-- =============================================

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Check if user is a school officer
CREATE OR REPLACE FUNCTION is_school_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM officers
    WHERE auth_user_id = auth.uid()
    AND role = 'school-officer'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get officer's department (returns department name, not ID)
CREATE OR REPLACE FUNCTION get_officer_department()
RETURNS VARCHAR AS $$
BEGIN
  RETURN (
    SELECT department FROM officers
    WHERE auth_user_id = auth.uid()
    AND status = 'active'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a department officer
CREATE OR REPLACE FUNCTION is_department_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM officers
    WHERE auth_user_id = auth.uid()
    AND role = 'department-officer'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is an active officer (any role)
CREATE OR REPLACE FUNCTION is_active_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM officers
    WHERE auth_user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 1. DEPARTMENTS TABLE
-- =============================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_departments"
ON departments FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all, no write
CREATE POLICY "department_officers_read_departments"
ON departments FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated users: Read all departments
CREATE POLICY "authenticated_read_departments"
ON departments FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- 2. OFFICERS TABLE
-- =============================================

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_officers"
ON officers FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all, update own profile
CREATE POLICY "department_officers_read_officers"
ON officers FOR SELECT
TO authenticated
USING (is_department_officer());

CREATE POLICY "officers_update_own_profile"
ON officers FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Officers can read their own record
CREATE POLICY "officers_read_own_record"
ON officers FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- =============================================
-- 3. SESSIONS TABLE
-- =============================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_sessions"
ON sessions FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all
CREATE POLICY "department_officers_read_sessions"
ON sessions FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all sessions
CREATE POLICY "authenticated_read_sessions"
ON sessions FOR SELECT
TO authenticated
USING (true);

-- Public: Read active sessions
CREATE POLICY "public_read_active_sessions"
ON sessions FOR SELECT
TO public
USING (status = 'active');

-- =============================================
-- 4. SEMESTERS TABLE
-- =============================================

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_semesters"
ON semesters FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all
CREATE POLICY "department_officers_read_semesters"
ON semesters FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all semesters
CREATE POLICY "authenticated_read_semesters"
ON semesters FOR SELECT
TO authenticated
USING (true);

-- Public: Read active semesters
CREATE POLICY "public_read_active_semesters"
ON semesters FOR SELECT
TO public
USING (status = 'active');

-- =============================================
-- 5. LECTURERS TABLE
-- =============================================

ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_lecturers"
ON lecturers FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department
CREATE POLICY "department_officers_department_lecturers"
ON lecturers FOR ALL
TO authenticated
USING (department = get_officer_department())
WITH CHECK (department = get_officer_department());

-- Department officers: Read all lecturers
CREATE POLICY "department_officers_read_all_lecturers"
ON lecturers FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read active lecturers
CREATE POLICY "authenticated_read_active_lecturers"
ON lecturers FOR SELECT
TO authenticated
USING (status = 'active');

-- =============================================
-- 6. LECTURER_AVAILABILITY TABLE
-- =============================================

ALTER TABLE lecturer_availability ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_availability"
ON lecturer_availability FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department lecturers
CREATE POLICY "department_officers_department_availability"
ON lecturer_availability FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lecturers l
    WHERE l.lecturer_id = lecturer_availability.lecturer_id
    AND l.department = get_officer_department()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lecturers l
    WHERE l.lecturer_id = lecturer_availability.lecturer_id
    AND l.department = get_officer_department()
  )
);

-- Department officers: Read all availability
CREATE POLICY "department_officers_read_all_availability"
ON lecturer_availability FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all availability
CREATE POLICY "authenticated_read_availability"
ON lecturer_availability FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- 7. COURSES TABLE
-- =============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_courses"
ON courses FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department
CREATE POLICY "department_officers_department_courses"
ON courses FOR ALL
TO authenticated
USING (department = get_officer_department())
WITH CHECK (department = get_officer_department());

-- Department officers: Read all courses
CREATE POLICY "department_officers_read_all_courses"
ON courses FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all courses
CREATE POLICY "authenticated_read_courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Public: Read GEDS courses
CREATE POLICY "public_read_geds_courses"
ON courses FOR SELECT
TO public
USING (category = 'GEDS');

-- =============================================
-- 8. VENUES TABLE
-- =============================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_venues"
ON venues FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all
CREATE POLICY "department_officers_read_venues"
ON venues FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read available venues
CREATE POLICY "authenticated_read_available_venues"
ON venues FOR SELECT
TO authenticated
USING (status = 'available');

-- =============================================
-- 9. CLASS_GROUPS TABLE
-- =============================================

ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_class_groups"
ON class_groups FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department
CREATE POLICY "department_officers_department_class_groups"
ON class_groups FOR ALL
TO authenticated
USING (department = get_officer_department())
WITH CHECK (department = get_officer_department());

-- Department officers: Read all class groups
CREATE POLICY "department_officers_read_all_class_groups"
ON class_groups FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all class groups
CREATE POLICY "authenticated_read_class_groups"
ON class_groups FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- 10. TIME_SLOTS TABLE
-- =============================================

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_time_slots"
ON time_slots FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all
CREATE POLICY "department_officers_read_time_slots"
ON time_slots FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all time slots
CREATE POLICY "authenticated_read_time_slots"
ON time_slots FOR SELECT
TO authenticated
USING (true);

-- Public: Read all time slots
CREATE POLICY "public_read_time_slots"
ON time_slots FOR SELECT
TO public
USING (true);

-- =============================================
-- 11. SPECIAL_EVENTS TABLE
-- =============================================

ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_special_events"
ON special_events FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Read all
CREATE POLICY "department_officers_read_special_events"
ON special_events FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read all special events
CREATE POLICY "authenticated_read_special_events"
ON special_events FOR SELECT
TO authenticated
USING (true);

-- Public: Read all special events
CREATE POLICY "public_read_special_events"
ON special_events FOR SELECT
TO public
USING (true);

-- =============================================
-- 12. TIMETABLES TABLE
-- =============================================

ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_timetables"
ON timetables FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department
CREATE POLICY "department_officers_department_timetables"
ON timetables FOR ALL
TO authenticated
USING (department = get_officer_department())
WITH CHECK (department = get_officer_department());

-- Department officers: Read all timetables
CREATE POLICY "department_officers_read_all_timetables"
ON timetables FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read approved/published timetables
CREATE POLICY "authenticated_read_approved_timetables"
ON timetables FOR SELECT
TO authenticated
USING (status IN ('approved', 'published'));

-- Public: Read published timetables
CREATE POLICY "public_read_published_timetables"
ON timetables FOR SELECT
TO public
USING (status = 'published');

-- =============================================
-- 13. SCHEDULES TABLE
-- =============================================

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_schedules"
ON schedules FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Full CRUD for own department timetables
CREATE POLICY "department_officers_department_schedules"
ON schedules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_groups cg
    WHERE cg.group_id = schedules.group_id
    AND cg.department = get_officer_department()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM class_groups cg
    WHERE cg.group_id = schedules.group_id
    AND cg.department = get_officer_department()
  )
);

-- Department officers: Read all schedules
CREATE POLICY "department_officers_read_all_schedules"
ON schedules FOR SELECT
TO authenticated
USING (is_department_officer());

-- Authenticated: Read schedules for approved/published timetables
CREATE POLICY "authenticated_read_approved_schedules"
ON schedules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM timetables t
    WHERE t.timetable_id = schedules.timetable_id
    AND t.status IN ('approved', 'published')
  )
);

-- Public: Read schedules for published timetables
CREATE POLICY "public_read_published_schedules"
ON schedules FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM timetables t
    WHERE t.timetable_id = schedules.timetable_id
    AND t.status = 'published'
  )
);

-- =============================================
-- 14. APPROVALS TABLE
-- =============================================

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_approvals"
ON approvals FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: Insert approvals for own department
CREATE POLICY "department_officers_submit_approvals"
ON approvals FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM officers o
    WHERE o.auth_user_id = auth.uid()
    AND o.officer_id = approvals.submitted_by
  )
);

-- Department officers: Read all approvals
CREATE POLICY "department_officers_read_approvals"
ON approvals FOR SELECT
TO authenticated
USING (is_department_officer());

-- Officers: Read own submitted approvals
CREATE POLICY "officers_read_own_approvals"
ON approvals FOR SELECT
TO authenticated
USING (
  submitted_by IN (
    SELECT officer_id FROM officers WHERE auth_user_id = auth.uid()
  )
);

-- =============================================
-- 15. CONFLICTS TABLE
-- =============================================

ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_conflicts"
ON conflicts FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: CRUD for own department timetables
CREATE POLICY "department_officers_department_conflicts"
ON conflicts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM timetables t
    WHERE t.timetable_id = conflicts.timetable_id
    AND t.department = get_officer_department()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM timetables t
    WHERE t.timetable_id = conflicts.timetable_id
    AND t.department = get_officer_department()
  )
);

-- Department officers: Read all conflicts
CREATE POLICY "department_officers_read_all_conflicts"
ON conflicts FOR SELECT
TO authenticated
USING (is_department_officer());

-- =============================================
-- 16. AUDIT_LOG TABLE
-- =============================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- School officers: Read all audit logs
CREATE POLICY "school_officers_read_audit_log"
ON audit_log FOR SELECT
TO authenticated
USING (is_school_officer());

-- Department officers: Read audit logs for own department data
CREATE POLICY "department_officers_read_department_audit_log"
ON audit_log FOR SELECT
TO authenticated
USING (
  is_department_officer() AND (
    -- Lecturers from their department
    (table_name = 'lecturers' AND EXISTS (
      SELECT 1 FROM lecturers l
      WHERE l.lecturer_id = audit_log.record_id
      AND l.department = get_officer_department()
    ))
    OR
    -- Courses from their department
    (table_name = 'courses' AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.course_id = audit_log.record_id
      AND c.department = get_officer_department()
    ))
    OR
    -- Class groups from their department
    (table_name = 'class_groups' AND EXISTS (
      SELECT 1 FROM class_groups cg
      WHERE cg.group_id = audit_log.record_id
      AND cg.department = get_officer_department()
    ))
  )
);

-- System: Auto-insert audit logs (no user policy needed, handled by triggers)

-- =============================================
-- 17. SYSTEM_SETTINGS TABLE
-- =============================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- School officers: Full CRUD
CREATE POLICY "school_officers_all_system_settings"
ON system_settings FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- All officers: Read system settings
CREATE POLICY "officers_read_system_settings"
ON system_settings FOR SELECT
TO authenticated
USING (is_active_officer());

-- Authenticated: Read public system settings
CREATE POLICY "authenticated_read_public_settings"
ON system_settings FOR SELECT
TO authenticated
USING (setting_key NOT LIKE 'private_%');

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to all sequences for inserts
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION is_school_officer() IS 'Check if current user is an active school officer';
COMMENT ON FUNCTION is_department_officer() IS 'Check if current user is an active department officer';
COMMENT ON FUNCTION is_active_officer() IS 'Check if current user is any active officer';
COMMENT ON FUNCTION get_officer_department() IS 'Get department name of current officer';

-- =============================================
-- END OF RLS POLICIES
-- =============================================