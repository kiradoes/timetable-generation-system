-- Add optional assignment for non-computing courses (lecturer, class group, day, time)
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS assignment JSONB DEFAULT NULL;

COMMENT ON COLUMN courses.assignment IS 'For non-computing courses: { lecturer_id, class_group_id, day_of_week, start_time, end_time }';
