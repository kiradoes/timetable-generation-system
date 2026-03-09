-- Add 'Summer' and 'Post-SIWES' to course_semester_enum so Course Management
-- can save courses for those semesters (fixes 400: invalid input value for enum course_semester_enum).
-- Existing values: 'First', 'Second', 'Both'. We add Summer and Post-SIWES.

ALTER TYPE course_semester_enum ADD VALUE IF NOT EXISTS 'Summer';
ALTER TYPE course_semester_enum ADD VALUE IF NOT EXISTS 'Post-SIWES';
