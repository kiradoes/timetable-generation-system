-- Remove New Horizon as a course of study (department).
-- New Horizon is a normal course/venue, not a department. Clean up any existing seed data.

-- Reassign COSC430 to Computer Science so it remains as a normal course students can take
UPDATE courses SET department = 'Computer Science' WHERE department = 'New Horizon';

-- Remove lecturers that were tied to the New Horizon department
DELETE FROM lecturers WHERE department = 'New Horizon';

-- Remove the department so it no longer appears in "Course of Study" dropdowns
DELETE FROM departments WHERE name = 'New Horizon';
