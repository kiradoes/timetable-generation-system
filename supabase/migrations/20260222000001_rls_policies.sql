-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Computer-Aided Timetable System
-- Date: 2026-02-22
-- =============================================
-- This migration enables RLS on all tables and creates policies for:
-- 1. School Officers (full read/write access)
-- 2. Department Officers (scoped to their department)
-- 3. Public access (for student timetable viewing)

-- =============================================
-- HELPER FUNCTION: Is School Officer
-- =============================================
CREATE OR REPLACE FUNCTION is_school_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.officers
    WHERE auth_user_id = auth.uid()
      AND role = 'school-officer'
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Get Officer's Department
-- =============================================
CREATE OR REPLACE FUNCTION get_officer_department()
RETURNS VARCHAR(50) AS $$
DECLARE
  dept VARCHAR(50);
BEGIN
  SELECT department INTO dept FROM public.officers
  WHERE auth_user_id = auth.uid() AND status = 'active'
  LIMIT 1;
  RETURN dept;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TABLE: OFFICERS
-- =============================================
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "officers_school_officer_all_access"
  ON public.officers
  FOR ALL
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "officers_user_read_own"
  ON public.officers
  FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "officers_department_officer_read_all"
  ON public.officers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.officers
      WHERE auth_user_id = auth.uid()
        AND role = 'department-officer'
        AND status = 'active'
    )
  );

-- =============================================
-- TABLE: SESSIONS
-- =============================================
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_authenticated_read"
  ON public.sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "sessions_school_officer_write"
  ON public.sessions
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "sessions_school_officer_update"
  ON public.sessions
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "sessions_school_officer_delete"
  ON public.sessions
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: DEPARTMENTS
-- =============================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_authenticated_read"
  ON public.departments
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "departments_school_officer_write"
  ON public.departments
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "departments_school_officer_update"
  ON public.departments
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "departments_school_officer_delete"
  ON public.departments
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: LECTURERS
-- =============================================
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecturers_authenticated_read"
  ON public.lecturers
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "lecturers_school_officer_write"
  ON public.lecturers
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "lecturers_school_officer_update"
  ON public.lecturers
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "lecturers_school_officer_delete"
  ON public.lecturers
  FOR DELETE
  USING (is_school_officer());

CREATE POLICY "lecturers_department_officer_manage_own_department"
  ON public.lecturers
  FOR ALL
  USING (
    department = get_officer_department() AND
    EXISTS (
      SELECT 1 FROM public.officers
      WHERE auth_user_id = auth.uid()
        AND role = 'department-officer'
        AND status = 'active'
    )
  );

-- =============================================
-- TABLE: COURSES
-- =============================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_authenticated_read"
  ON public.courses
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "courses_school_officer_write"
  ON public.courses
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "courses_school_officer_update"
  ON public.courses
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "courses_school_officer_delete"
  ON public.courses
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: NON_COMPUTING_COURSES (GEDS/SAT)
-- =============================================
ALTER TABLE public.non_computing_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "non_computing_courses_authenticated_read"
  ON public.non_computing_courses
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "non_computing_courses_school_officer_write"
  ON public.non_computing_courses
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "non_computing_courses_school_officer_update"
  ON public.non_computing_courses
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "non_computing_courses_school_officer_delete"
  ON public.non_computing_courses
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: VENUES
-- =============================================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_authenticated_read"
  ON public.venues
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "venues_school_officer_write"
  ON public.venues
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "venues_school_officer_update"
  ON public.venues
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "venues_school_officer_delete"
  ON public.venues
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: CLASS_GROUPS
-- =============================================
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "class_groups_authenticated_read"
  ON public.class_groups
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "class_groups_school_officer_write"
  ON public.class_groups
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "class_groups_school_officer_update"
  ON public.class_groups
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "class_groups_school_officer_delete"
  ON public.class_groups
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: SEMESTERS
-- =============================================
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semesters_authenticated_read"
  ON public.semesters
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "semesters_school_officer_write"
  ON public.semesters
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "semesters_school_officer_update"
  ON public.semesters
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "semesters_school_officer_delete"
  ON public.semesters
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: TIME_SLOTS
-- =============================================
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_slots_authenticated_read"
  ON public.time_slots
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "time_slots_school_officer_write"
  ON public.time_slots
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "time_slots_school_officer_update"
  ON public.time_slots
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "time_slots_school_officer_delete"
  ON public.time_slots
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: SPECIAL_EVENTS
-- =============================================
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "special_events_authenticated_read"
  ON public.special_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "special_events_school_officer_write"
  ON public.special_events
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "special_events_school_officer_update"
  ON public.special_events
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "special_events_school_officer_delete"
  ON public.special_events
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: TIMETABLES
-- =============================================
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timetables_authenticated_read"
  ON public.timetables
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "timetables_school_officer_write"
  ON public.timetables
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "timetables_school_officer_update"
  ON public.timetables
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "timetables_school_officer_delete"
  ON public.timetables
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: SCHEDULES
-- =============================================
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_authenticated_read"
  ON public.schedules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "schedules_school_officer_write"
  ON public.schedules
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "schedules_school_officer_update"
  ON public.schedules
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "schedules_school_officer_delete"
  ON public.schedules
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: CONFLICTS
-- =============================================
ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conflicts_authenticated_read"
  ON public.conflicts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "conflicts_school_officer_write"
  ON public.conflicts
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "conflicts_school_officer_update"
  ON public.conflicts
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "conflicts_school_officer_delete"
  ON public.conflicts
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: LECTURER_AVAILABILITY
-- =============================================
ALTER TABLE public.lecturer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecturer_availability_authenticated_read"
  ON public.lecturer_availability
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "lecturer_availability_school_officer_write"
  ON public.lecturer_availability
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "lecturer_availability_school_officer_update"
  ON public.lecturer_availability
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "lecturer_availability_school_officer_delete"
  ON public.lecturer_availability
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: APPROVALS
-- =============================================
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approvals_authenticated_read"
  ON public.approvals
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "approvals_school_officer_write"
  ON public.approvals
  FOR INSERT
  WITH CHECK (is_school_officer());

CREATE POLICY "approvals_school_officer_update"
  ON public.approvals
  FOR UPDATE
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

CREATE POLICY "approvals_school_officer_delete"
  ON public.approvals
  FOR DELETE
  USING (is_school_officer());

-- =============================================
-- TABLE: AUDIT_LOG (Read-only for auditing)
-- =============================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_school_officer_read"
  ON public.audit_log
  FOR SELECT
  USING (is_school_officer());

-- =============================================
-- TABLE: SYSTEM_SETTINGS
-- =============================================
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_authenticated_read_public"
  ON public.system_settings
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = TRUE);

CREATE POLICY "system_settings_school_officer_all"
  ON public.system_settings
  FOR ALL
  USING (is_school_officer())
  WITH CHECK (is_school_officer());

-- =============================================
-- RLS SUMMARY
-- =============================================
-- All tables now have RLS enabled with policies:
--
-- 1. SCHOOL OFFICERS (role = 'school-officer')
--    - Full read/write/delete access to ALL tables
--    - Can perform all operations
--
-- 2. DEPARTMENT OFFICERS (role = 'department-officer')
--    - Read access to all data for visibility
--    - Write access ONLY to their department's lecturers
--    - Limited to department-specific operations
--
-- 3. AUTHENTICATED USERS (general)
--    - Can read all tables (for UI display)
--    - Cannot create/update/delete (protected by policies)
--
-- 4. PUBLIC (unauthenticated)
--    - No direct access (RLS requires authentication)
--    - Public timetables accessed via auth-protected URLs
--
-- =============================================
-- VERIFICATION QUERIES (Run as needed)
-- =============================================
/*
-- Check which policies are active:
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test as specific user:
SET LOCAL ROLE authenticated;
SET LOCAL "auth.uid" TO 'user-uuid-here';
SELECT * FROM public.officers LIMIT 1;

-- Check table RLS status:
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
*/
