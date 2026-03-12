-- Landing page semester dropdown: show First, Second, Summer, Post-SIWES, and any other
-- semesters for the session. Public (students) can read all semesters, not only the active one.
DROP POLICY IF EXISTS "public_read_active_semesters" ON semesters;
CREATE POLICY "public_read_all_semesters"
ON semesters FOR SELECT
TO public
USING (true);
