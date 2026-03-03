-- Clear semester-related data: schedules, timetables, approvals; reset semester publish status.
-- Run this to empty the timetable for all semesters so you can rebuild from scratch.
-- Does NOT delete semester records (First/Second) or sessions, lecturers, courses, etc.

-- 1. Remove approvals (they reference timetables)
DELETE FROM approvals;

-- 2. Remove all scheduled classes (the actual timetable assignments)
DELETE FROM schedules;

-- 3. Remove timetables (they reference semesters)
DELETE FROM timetables;

-- 4. Reset all semesters to not published (so students don't see old timetable)
UPDATE semesters SET timetable_status = 'approved' WHERE timetable_status = 'published';

COMMENT ON TABLE schedules IS 'Core timetable: one row per scheduled class. Cleared by 20260311000001_clear_semester_data.sql when resetting.';
