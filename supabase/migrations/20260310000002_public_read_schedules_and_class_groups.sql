-- Allow landing-page users (anonymous) to see schedules and class groups so they can view timetables.

-- 1) Public can read class_groups (active only) so the Find Your Timetable form can load
--    "Course of Study" -> "Level" -> "Group" and resolve group_id for the selected group.
CREATE POLICY "public_read_active_class_groups"
ON class_groups FOR SELECT
TO public
USING (status = 'active');

-- 2) Public can read schedules when the session has a published semester.
--    Officers publish via semester.timetable_status = 'published'; schedules often have
--    timetable_id = null, so the existing policy (timetable.status = 'published') does not apply.
--    This policy lets students see schedules once the officer has published the timetable.
CREATE POLICY "public_read_schedules_when_semester_published"
ON schedules FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM semesters s
    WHERE s.session_id = schedules.session_id
    AND s.timetable_status = 'published'
  )
);

COMMENT ON POLICY "public_read_active_class_groups" ON class_groups IS 'Student landing page can list groups by session/department/level.';
COMMENT ON POLICY "public_read_schedules_when_semester_published" ON schedules IS 'Students can view schedules when a semester for that session is published.';
