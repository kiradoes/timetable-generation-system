-- Allow all users (including anonymous on the landing page) to read courses, lecturers, and venues
-- so the timetable view can show course names, lecturer names, and venue names for published schedules.

-- 1) Public can read all courses (Computing, GEDS, SAT) so timetable and schedule joins work.
--    (GEDS already had public_read_geds_courses; this extends to all categories.)
CREATE POLICY "public_read_courses"
ON courses FOR SELECT
TO public
USING (true);

-- 2) Public can read active lecturers so timetable shows lecturer names.
CREATE POLICY "public_read_active_lecturers"
ON lecturers FOR SELECT
TO public
USING (status = 'active');

-- 3) Public can read all venues so timetable shows venue names.
CREATE POLICY "public_read_venues"
ON venues FOR SELECT
TO public
USING (true);

COMMENT ON POLICY "public_read_courses" ON courses IS 'All users can see course codes and titles on the timetable.';
COMMENT ON POLICY "public_read_active_lecturers" ON lecturers IS 'All users can see lecturer names on the timetable.';
COMMENT ON POLICY "public_read_venues" ON venues IS 'All users can see venue names on the timetable.';
