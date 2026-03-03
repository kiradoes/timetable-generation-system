-- Allow unauthenticated (public/anon) users to read active departments
-- so the student landing page "Course of Study" dropdown can load.
CREATE POLICY "public_read_active_departments"
ON departments FOR SELECT
TO public
USING (status = 'active');

COMMENT ON POLICY "public_read_active_departments" ON departments IS 'Student landing page and public timetable search can list active departments.';
